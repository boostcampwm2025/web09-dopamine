/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { useCategoryMutations } from '@/hooks';
import * as categoryApi from '@/lib/api/category';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 의존성 모킹
jest.mock('@/lib/api/category');
jest.mock('react-hot-toast');

// 2. React Query 모킹
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

// 3. Store 모킹 (껍데기만 생성)
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
  const mockSetQueryData = jest.fn(); // 혹시 모를 의존성 대비 추가

  beforeEach(() => {
    jest.clearAllMocks();

    // mockReturnValue 대신 mockImplementation 사용
    // 이렇게 하면 호출 시점에 확실하게 객체를 만들어 반환합니다.
    (useQueryClient as jest.Mock).mockImplementation(() => ({
      invalidateQueries: mockInvalidateQueries,
      getQueryData: mockGetQueryData,
      setQueryData: mockSetQueryData,
    }));

    // Store 모킹 구현 주입
    (useSseConnectionStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        connectionIds: {
          [issueId]: connectionId,
        },
      });
    });

    // 기본적으로 빈 배열 반환 (중복 검사 통과)
    mockGetQueryData.mockReturnValue([]);

    // console.error 모킹 (테스트 로그 오염 방지)
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create (카테고리 생성)', () => {
    const payload = { title: 'New Category', positionX: 100, positionY: 100 };

    test('성공 시 API를 호출하고 쿼리를 무효화해야 한다', async () => {
      // Given
      mockCreateCategory.mockResolvedValue({});
      const { result } = renderHook(() => useCategoryMutations(issueId));

      // When
      await act(async () => {
        result.current.create.mutate(payload);
      });

      // Then
      await waitFor(() => expect(result.current.create.isSuccess).toBe(true));

      expect(mockCreateCategory).toHaveBeenCalledWith(issueId, payload, connectionId);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });

    test('실패 시 에러 토스트를 띄우고 쿼리를 무효화해야 한다', async () => {
      // Given
      const errorMsg = '생성 실패';
      mockCreateCategory.mockRejectedValue(new Error(errorMsg));
      const { result } = renderHook(() => useCategoryMutations(issueId));

      // When
      act(() => {
        result.current.create.mutate(payload);
      });

      // Then
      await waitFor(() => expect(result.current.create.isError).toBe(true));

      expect(mockToastError).toHaveBeenCalledWith(errorMsg);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });
  });

  describe('update (카테고리 수정)', () => {
    const categoryId = 'cat-1';
    const updatePayload = { title: 'Updated Title' };

    test('성공 시 수정 API를 호출하고 쿼리를 무효화해야 한다', async () => {
      // Given
      mockUpdateCategory.mockResolvedValue({});
      const { result } = renderHook(() => useCategoryMutations(issueId));

      // When
      act(() => {
        result.current.update.mutate({ categoryId, payload: updatePayload });
      });

      // Then
      await waitFor(() => expect(result.current.update.isSuccess).toBe(true));

      expect(mockUpdateCategory).toHaveBeenCalledWith(
        issueId,
        categoryId,
        updatePayload,
        connectionId,
      );
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });

    test('실패 시 에러 토스트를 띄워야 한다', async () => {
      // Given
      mockUpdateCategory.mockRejectedValue(new Error('수정 오류'));
      const { result } = renderHook(() => useCategoryMutations(issueId));

      // When
      act(() => {
        result.current.update.mutate({ categoryId, payload: updatePayload });
      });

      // Then
      await waitFor(() => expect(result.current.update.isError).toBe(true));

      expect(mockToastError).toHaveBeenCalledWith('수정 오류');
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });
  });

  describe('remove (카테고리 삭제)', () => {
    const categoryId = 'cat-1';

    test('성공 시 삭제 API를 호출하고 쿼리를 무효화해야 한다', async () => {
      // Given
      mockDeleteCategory.mockResolvedValue({});
      const { result } = renderHook(() => useCategoryMutations(issueId));

      // When
      act(() => {
        result.current.remove.mutate(categoryId);
      });

      // Then
      await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));

      expect(mockDeleteCategory).toHaveBeenCalledWith(issueId, categoryId, connectionId);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });

    test('실패 시 에러 토스트를 띄워야 한다', async () => {
      // Given
      mockDeleteCategory.mockRejectedValue(new Error('삭제 오류'));
      const { result } = renderHook(() => useCategoryMutations(issueId));

      // When
      act(() => {
        result.current.remove.mutate(categoryId);
      });

      // Then
      await waitFor(() => expect(result.current.remove.isError).toBe(true));

      expect(mockToastError).toHaveBeenCalledWith('삭제 오류');
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });
  });
});
