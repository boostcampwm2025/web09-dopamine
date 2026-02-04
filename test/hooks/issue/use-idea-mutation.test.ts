/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';
import { useIdeaMutations } from '@/hooks';
import * as ideaApi from '@/lib/api/idea';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 의존성 모킹
jest.mock('@/lib/api/idea');
jest.mock('react-hot-toast');

// 2. React Query 모킹
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

// 3. Store 모킹 (껍데기 생성)
jest.mock('@/app/(with-sidebar)/issue/store/use-sse-connection-store', () => ({
  useSseConnectionStore: jest.fn(),
}));

describe('useIdeaMutations', () => {
  const issueId = 'issue-1';
  const connectionId = 'conn-1'; // 테스트용 connectionId
  const queryKey = ['issues', issueId, 'ideas'];

  // Mock 함수들
  const mockCreateIdea = ideaApi.createIdea as jest.Mock;
  const mockUpdateIdea = ideaApi.updateIdea as jest.Mock;
  const mockDeleteIdea = ideaApi.deleteIdea as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  // QueryClient Spy
  const mockGetQueryData = jest.fn();
  const mockSetQueryData = jest.fn();
  const mockCancelQueries = jest.fn();
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: mockGetQueryData,
      setQueryData: mockSetQueryData,
      cancelQueries: mockCancelQueries,
      invalidateQueries: mockInvalidateQueries,
    });

    // Store 구현 주입: 특정 issueId에 대해 connectionId 반환
    (useSseConnectionStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        connectionIds: {
          [issueId]: connectionId,
        },
      });
    });

    // console.error 모킹
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createIdea', () => {
    test('성공 시 API를 호출해야 한다', async () => {
      // Given
      mockCreateIdea.mockResolvedValue({});
      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When
      act(() => {
        result.current.createIdea({ userId: 'user-1', categoryId: null, content: 'New Idea' });
      });

      // Then
      await waitFor(() => expect(result.current.isCreating).toBe(false));

      // 수정: connectionId 포함 확인
      expect(mockCreateIdea).toHaveBeenCalledWith(
        issueId,
        expect.objectContaining({ content: 'New Idea' }),
        connectionId, // 3번째 인자 확인
      );
    });

    test('실패 시 에러 토스트를 띄워야 한다', async () => {
      // Given
      mockCreateIdea.mockRejectedValue(new Error('생성 실패'));
      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When
      act(() => {
        result.current.createIdea({ userId: 'user-1', categoryId: null, content: 'Fail Idea' });
      });

      // Then
      await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('생성 실패'));
    });
  });

  describe('updateIdea (낙관적 업데이트)', () => {
    const initialIdeas: IdeaWithPosition[] = [
      { id: 'idea-1', content: 'Original', position: { x: 0, y: 0 }, categoryId: 'cat-1' } as any,
    ];

    test('성공 시 캐시를 즉시 업데이트(위치 객체 변환 포함)하고 API를 호출해야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue(initialIdeas);
      mockUpdateIdea.mockResolvedValue({});

      const { result } = renderHook(() => useIdeaMutations(issueId));
      const updatePayload = {
        ideaId: 'idea-1',
        positionX: 100,
        positionY: 200,
        categoryId: 'cat-2',
      };

      // When
      await act(async () => {
        result.current.updateIdea(updatePayload);
      });

      // Then
      expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey });

      // setQueryData 확인
      expect(mockSetQueryData).toHaveBeenCalledWith(
        queryKey,
        expect.arrayContaining([
          expect.objectContaining({
            id: 'idea-1',
            position: { x: 100, y: 200 },
            categoryId: 'cat-2',
          }),
        ]),
      );

      // 수정: connectionId 포함 확인 (4번째 인자)
      expect(mockUpdateIdea).toHaveBeenCalledWith(
        issueId,
        'idea-1',
        {
          positionX: 100,
          positionY: 200,
          categoryId: 'cat-2',
        },
        connectionId,
      );
      await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey }));
    });

    test('실패 시 이전 데이터로 롤백해야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue(initialIdeas);
      mockUpdateIdea.mockRejectedValue(new Error('Update Failed'));

      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When
      await act(async () => {
        result.current.updateIdea({ ideaId: 'idea-1', positionX: 999 });
      });

      // Then
      await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Update Failed'));

      // 롤백 확인
      expect(mockSetQueryData).toHaveBeenLastCalledWith(queryKey, initialIdeas);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });

    test('부분 수정: 위치만 변경하고 카테고리는 건너뛰어야 하며, 다른 아이디어는 변경되지 않아야 한다', async () => {
      // Given: 아이디어 2개 (수정 대상, 비수정 대상)
      const targetIdea = {
        id: 'target',
        content: 'T',
        position: { x: 0, y: 0 },
        categoryId: 'cat-1',
      };
      const otherIdea = {
        id: 'other',
        content: 'O',
        position: { x: 1, y: 1 },
        categoryId: 'cat-1',
      };

      mockGetQueryData.mockReturnValue([targetIdea, otherIdea]);
      mockUpdateIdea.mockResolvedValue({});

      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When: 위치만 수정 (categoryId는 undefined)
      await act(async () => {
        result.current.updateIdea({
          ideaId: 'target',
          positionX: 50,
          positionY: 50,
          // categoryId 생략 (undefined)
        });
      });

      // Then
      expect(mockSetQueryData).toHaveBeenCalledTimes(1);
      const passedData = mockSetQueryData.mock.calls[0][1];

      // 1. 타겟 아이디어: 위치는 바뀌고 카테고리는 그대로여야 함
      expect(passedData[0].position).toEqual({ x: 50, y: 50 });
      expect(passedData[0].categoryId).toBe('cat-1'); // 기존 값 유지

      // 2. 다른 아이디어: 아무것도 바뀌지 않아야 함 (Branch: idea.id !== ideaId)
      expect(passedData[1]).toBe(otherIdea);
    });

    test('부분 수정: 카테고리만 변경하고 위치 로직은 건너뛰어야 한다', async () => {
      // Given
      const targetIdea = { id: 'target', position: { x: 0, y: 0 }, categoryId: 'old-cat' };
      mockGetQueryData.mockReturnValue([targetIdea]);
      mockUpdateIdea.mockResolvedValue({});

      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When: 카테고리만 수정 (위치 생략)
      await act(async () => {
        result.current.updateIdea({
          ideaId: 'target',
          categoryId: 'new-cat',
        });
      });

      // Then
      const passedData = mockSetQueryData.mock.calls[0][1];

      // 위치는 그대로, 카테고리만 변경
      expect(passedData[0].position).toEqual({ x: 0, y: 0 });
      expect(passedData[0].categoryId).toBe('new-cat');
    });

    test('부분 수정: X좌표는 있지만 Y좌표가 없으면(undefined) 위치 업데이트를 건너뛰어야 한다', async () => {
      // Given: 초기 위치 (0, 0)
      const targetIdea = { id: 'target', position: { x: 0, y: 0 }, categoryId: 'cat-1' };
      mockGetQueryData.mockReturnValue([targetIdea]);
      mockUpdateIdea.mockResolvedValue({});

      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When: X는 100으로 주지만 Y는 안 줌 (undefined)
      await act(async () => {
        result.current.updateIdea({
          ideaId: 'target',
          positionX: 100,
          // positionY is undefined
        });
      });

      // Then
      expect(mockSetQueryData).toHaveBeenCalledTimes(1);
      const passedData = mockSetQueryData.mock.calls[0][1];

      // 로직상 둘 다 있어야 업데이트하므로, 기존 위치(0,0)가 유지되어야 함
      expect(passedData[0].position).toEqual({ x: 0, y: 0 });
    });
  });

  describe('removeIdea (낙관적 업데이트)', () => {
    const initialIdeas = [
      { id: 'idea-1', content: 'To be deleted' },
      { id: 'idea-2', content: 'Survivor' },
    ];

    test('성공 시 캐시에서 즉시 삭제하고 API를 호출해야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue(initialIdeas);
      mockDeleteIdea.mockResolvedValue({});

      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When
      await act(async () => {
        result.current.removeIdea('idea-1');
      });

      // Then
      expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey });

      // 낙관적 삭제 검증
      expect(mockSetQueryData).toHaveBeenCalledWith(queryKey, [
        { id: 'idea-2', content: 'Survivor' },
      ]);

      // 수정: connectionId 포함 확인 (3번째 인자)
      expect(mockDeleteIdea).toHaveBeenCalledWith(issueId, 'idea-1', connectionId);
      await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey }));
    });

    test('실패 시 삭제된 항목을 롤백해야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue(initialIdeas);
      mockDeleteIdea.mockRejectedValue(new Error('Delete Failed'));

      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When
      await act(async () => {
        result.current.removeIdea('idea-1');
      });

      // Then
      await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Delete Failed'));

      // 롤백 확인
      expect(mockSetQueryData).toHaveBeenLastCalledWith(queryKey, initialIdeas);
    });
  });

  describe('Edge Cases (데이터 누락 상황)', () => {
    test('Cache Miss: 캐시가 없으면(undefined) 낙관적 업데이트를 수행하지 않아야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue(undefined); // 데이터 없음
      mockUpdateIdea.mockResolvedValue({});

      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When
      await act(async () => {
        result.current.updateIdea({ ideaId: 'idea-1', categoryId: 'cat-new' });
      });

      // Then
      expect(mockSetQueryData).not.toHaveBeenCalled(); // 낙관적 업데이트 스킵
      expect(mockUpdateIdea).toHaveBeenCalled(); // API는 호출됨
    });

    test('Context Missing: 실패 시 이전 데이터(Context)가 없으면 롤백하지 않아야 한다', async () => {
      // Given: 캐시가 없어서 onMutate에서 context를 못 만든 상황
      mockGetQueryData.mockReturnValue(undefined);
      mockUpdateIdea.mockRejectedValue(new Error('Fail'));

      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When
      await act(async () => {
        result.current.updateIdea({ ideaId: 'idea-1', categoryId: 'cat-new' });
      });

      // Then
      await waitFor(() => expect(mockToastError).toHaveBeenCalled());

      // 롤백(setQueryData) 실행 안 됨
      expect(mockSetQueryData).not.toHaveBeenCalled();
    });

    // ... 기존 updateIdea Edge Cases 아래에 추가 ...

    test('removeIdea - Cache Miss: 캐시가 없으면(undefined) 낙관적 삭제를 수행하지 않아야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue(undefined);
      mockDeleteIdea.mockResolvedValue({});

      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When
      await act(async () => {
        result.current.removeIdea('idea-1');
      });

      // Then
      expect(mockSetQueryData).not.toHaveBeenCalled(); // 스킵 확인
      expect(mockDeleteIdea).toHaveBeenCalled(); // API 호출 확인
    });

    test('removeIdea - Context Missing: 실패 시 이전 데이터(Context)가 없으면 롤백하지 않아야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue(undefined);
      mockDeleteIdea.mockRejectedValue(new Error('Fail'));

      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When
      await act(async () => {
        result.current.removeIdea('idea-1');
      });

      // Then
      await waitFor(() => expect(mockToastError).toHaveBeenCalled());
      expect(mockSetQueryData).not.toHaveBeenCalled();
    });
  });
});
