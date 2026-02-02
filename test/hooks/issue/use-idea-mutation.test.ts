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
    test('성공 시 API를 호출하고 쿼리를 무효화해야 한다', async () => {
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
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });

    test('실패 시 에러 토스트를 띄우고(onSettled) 쿼리를 무효화해야 한다', async () => {
      // Given
      mockCreateIdea.mockRejectedValue(new Error('생성 실패'));
      const { result } = renderHook(() => useIdeaMutations(issueId));

      // When
      act(() => {
        result.current.createIdea({ userId: 'user-1', categoryId: null, content: 'Fail Idea' });
      });

      // Then
      await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('생성 실패'));
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
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
});
