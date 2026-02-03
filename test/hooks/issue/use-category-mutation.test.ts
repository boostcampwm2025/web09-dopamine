/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { CLIENT_ERROR_MESSAGES } from '@/constants/error-messages';
import { useCategoryMutations } from '@/hooks';
import * as categoryApi from '@/lib/api/category';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 의존성 모킹
jest.mock('@/lib/api/category');
jest.mock('react-hot-toast');
jest.mock('@/constants/error-messages', () => ({
  CLIENT_ERROR_MESSAGES: {
    CATEGORY_ALREADY_EXISTS: '이미 존재하는 카테고리입니다.',
  },
}));

// 2. React Query 모킹
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

// 3. Store 모킹
jest.mock('@/app/(with-sidebar)/issue/store/use-sse-connection-store', () => ({
  useSseConnectionStore: jest.fn(),
}));

describe('useCategoryMutations', () => {
  const issueId = 'issue-123';
  const connectionId = 'conn-1';
  const queryKey = ['issues', issueId, 'categories'];

  // Mock 함수들
  const mockCreateCategory = categoryApi.createCategory as jest.Mock;
  const mockUpdateCategory = categoryApi.updateCategory as jest.Mock;
  const mockDeleteCategory = categoryApi.deleteCategory as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  // QueryClient Spy
  const mockInvalidateQueries = jest.fn();
  const mockGetQueryData = jest.fn();
  const mockSetQueryData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
      getQueryData: mockGetQueryData,
      setQueryData: mockSetQueryData,
    });

    (useSseConnectionStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        connectionIds: {
          [issueId]: connectionId,
        },
      });
    });

    // 기본적으로 빈 배열 반환
    mockGetQueryData.mockReturnValue([]);

    // 에러 로그 숨김
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create (카테고리 생성)', () => {
    const payload = { title: 'New Category', positionX: 100, positionY: 100 };

    test('성공 시 API를 호출하고 쿼리를 무효화해야 한다', async () => {
      mockCreateCategory.mockResolvedValue({});
      const { result } = renderHook(() => useCategoryMutations(issueId));

      await act(async () => {
        result.current.create.mutate(payload);
      });

      await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
      expect(mockCreateCategory).toHaveBeenCalledWith(issueId, payload, connectionId);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });

    // 중복 이름 생성 방지
    test('이미 존재하는 이름으로 생성하려 하면 API 호출 없이 에러 토스트를 띄운다', async () => {
      // Given: 이미 'New Category'라는 카테고리가 캐시에 있음
      mockGetQueryData.mockReturnValue([{ id: '1', title: 'New Category' }]);

      const { result } = renderHook(() => useCategoryMutations(issueId));

      // When
      act(() => {
        result.current.create.mutate({ title: 'New Category' });
      });

      // Then
      await waitFor(() => expect(result.current.create.isError).toBe(true));

      // 토스트 메시지 확인
      expect(mockToastError).toHaveBeenCalledWith(CLIENT_ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
      // API는 절대 호출되면 안 됨!
      expect(mockCreateCategory).not.toHaveBeenCalled();
    });

    test('API 실패 시 에러 토스트를 띄우고 쿼리를 무효화해야 한다', async () => {
      const errorMsg = '생성 실패';
      mockCreateCategory.mockRejectedValue(new Error(errorMsg));
      const { result } = renderHook(() => useCategoryMutations(issueId));

      act(() => {
        result.current.create.mutate(payload);
      });

      await waitFor(() => expect(result.current.create.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith(errorMsg);
    });
  });

  describe('update (카테고리 수정)', () => {
    const categoryId = 'cat-1';

    test('이름 변경 없이 위치만 수정하는 경우 중복 체크를 건너뛰고 성공한다', async () => {
      // Given: 이름 필드가 없는 payload
      const movePayload = { positionX: 200 };
      mockUpdateCategory.mockResolvedValue({});

      const { result } = renderHook(() => useCategoryMutations(issueId));

      act(() => {
        result.current.update.mutate({ categoryId, payload: movePayload });
      });

      await waitFor(() => expect(result.current.update.isSuccess).toBe(true));
      expect(mockUpdateCategory).toHaveBeenCalledWith(
        issueId,
        categoryId,
        movePayload,
        connectionId,
      );
    });

    test('이름을 변경할 때 다른 카테고리와 중복되면 에러 토스트를 띄운다', async () => {
      // Given: 'Existing'이라는 다른 카테고리가 있음
      mockGetQueryData.mockReturnValue([
        { id: 'cat-2', title: 'Existing' }, // 다른 놈
        { id: 'cat-1', title: 'My Category' }, // 나
      ]);

      const { result } = renderHook(() => useCategoryMutations(issueId));

      // When: 내 이름을 'Existing'으로 바꾸려 함
      act(() => {
        result.current.update.mutate({ categoryId, payload: { title: 'Existing' } });
      });

      // Then
      await waitFor(() => expect(result.current.update.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith(CLIENT_ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
      expect(mockUpdateCategory).not.toHaveBeenCalled();
    });

    test('내 자신의 이름으로 변경(그대로 유지)하는 경우는 중복 에러가 나지 않아야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue([{ id: 'cat-1', title: 'My Name' }]);
      mockUpdateCategory.mockResolvedValue({});

      const { result } = renderHook(() => useCategoryMutations(issueId));

      // When: 'My Name' -> 'My Name'
      act(() => {
        result.current.update.mutate({ categoryId, payload: { title: 'My Name' } });
      });

      // Then
      await waitFor(() => expect(result.current.update.isSuccess).toBe(true));
      expect(mockUpdateCategory).toHaveBeenCalled();
    });

    test('API 실패 시 에러 토스트를 띄워야 한다', async () => {
      mockUpdateCategory.mockRejectedValue(new Error('수정 오류'));
      const { result } = renderHook(() => useCategoryMutations(issueId));

      act(() => {
        result.current.update.mutate({ categoryId, payload: { title: 'Valid' } });
      });

      await waitFor(() => expect(result.current.update.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('수정 오류');
    });
  });

  describe('remove (카테고리 삭제)', () => {
    const categoryId = 'cat-1';

    test('성공 시 삭제 API를 호출하고 쿼리를 무효화해야 한다', async () => {
      mockDeleteCategory.mockResolvedValue({});
      const { result } = renderHook(() => useCategoryMutations(issueId));

      act(() => {
        result.current.remove.mutate(categoryId);
      });

      await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
      expect(mockDeleteCategory).toHaveBeenCalledWith(issueId, categoryId, connectionId);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });

    test('실패 시 에러 토스트를 띄워야 한다', async () => {
      mockDeleteCategory.mockRejectedValue(new Error('삭제 오류'));
      const { result } = renderHook(() => useCategoryMutations(issueId));

      act(() => {
        result.current.remove.mutate(categoryId);
      });

      await waitFor(() => expect(result.current.remove.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('삭제 오류');
    });
  });
});
