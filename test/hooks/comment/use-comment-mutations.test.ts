/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { getCommentQueryKey, useCommentMutations } from '@/hooks';
import * as commentApi from '@/lib/api/comment';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 의존성 모킹
jest.mock('@/lib/api/comment');
jest.mock('@/hooks/comment/use-comment-query');

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

describe('useCommentMutations', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';
  const connectionId = 'conn-1'; // 테스트용 connectionId
  const queryKey = ['comments', issueId, ideaId];

  // Mock 함수들
  const mockCreateComment = commentApi.createComment as jest.Mock;
  const mockUpdateComment = commentApi.updateComment as jest.Mock;
  const mockDeleteComment = commentApi.deleteComment as jest.Mock;
  const mockGetCommentQueryKey = getCommentQueryKey as jest.Mock;

  // QueryClient Spy
  const mockSetQueryData = jest.fn();
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useQueryClient as jest.Mock).mockReturnValue({
      setQueryData: mockSetQueryData,
      invalidateQueries: mockInvalidateQueries,
    });

    mockGetCommentQueryKey.mockReturnValue(queryKey);

    (useSseConnectionStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        connectionIds: {
          [issueId]: connectionId,
        },
      });
    });
  });

  describe('createMutation (댓글 생성)', () => {
    test('성공 시 캐시에 댓글을 추가하고 아이디어 쿼리를 무효화해야 한다', async () => {
      // Given
      const newComment = { id: 'c-new', content: 'New Comment', userId: 'user-1' };
      mockCreateComment.mockResolvedValue(newComment);

      const { result } = renderHook(() => useCommentMutations(issueId, ideaId));

      // When
      act(() => {
        result.current.createMutation.mutate({ userId: 'user-1', content: 'New Comment' });
      });

      // Then
      await waitFor(() => expect(result.current.createMutation.isSuccess).toBe(true));

      // connectionId 포함 확인 (4번째 인자)
      expect(mockCreateComment).toHaveBeenCalledWith(
        issueId,
        ideaId,
        {
          userId: 'user-1',
          content: 'New Comment',
        },
        connectionId,
      );

      // setQueryData 확인
      expect(mockSetQueryData).toHaveBeenCalledWith(queryKey, expect.any(Function));

      const updater = mockSetQueryData.mock.calls[0][1];
      const prevData = [{ id: 'c-old', content: 'Old' }];
      const nextData = updater(prevData);
      expect(nextData).toEqual([...prevData, newComment]);

      // 무효화 확인
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['issues', issueId, 'ideas', ideaId],
      });
    });
  });

  describe('updateMutation (댓글 수정)', () => {
    test('성공 시 캐시 내의 특정 댓글 내용만 업데이트해야 한다', async () => {
      // Given
      const updatedResponse = { id: 'c-1', content: 'Updated Content' };
      mockUpdateComment.mockResolvedValue(updatedResponse);

      const { result } = renderHook(() => useCommentMutations(issueId, ideaId));

      // When
      act(() => {
        result.current.updateMutation.mutate({ commentId: 'c-1', content: 'Updated Content' });
      });

      // Then
      await waitFor(() => expect(result.current.updateMutation.isSuccess).toBe(true));

      // connectionId 포함 확인 (5번째 인자)
      expect(mockUpdateComment).toHaveBeenCalledWith(
        issueId,
        ideaId,
        'c-1',
        { content: 'Updated Content' },
        connectionId,
      );

      // 캐시 업데이트 로직 검증
      expect(mockSetQueryData).toHaveBeenCalledWith(queryKey, expect.any(Function));

      const updater = mockSetQueryData.mock.calls[0][1];
      const prevData = [
        { id: 'c-1', content: 'Original' },
        { id: 'c-2', content: 'Other' },
      ];
      const nextData = updater(prevData);

      expect(nextData).toEqual([
        { id: 'c-1', content: 'Updated Content' },
        { id: 'c-2', content: 'Other' },
      ]);
    });
  });

  describe('deleteMutation (댓글 삭제)', () => {
    test('성공 시 캐시에서 해당 댓글을 제거하고 아이디어 쿼리를 무효화해야 한다', async () => {
      // Given
      mockDeleteComment.mockResolvedValue({});

      const { result } = renderHook(() => useCommentMutations(issueId, ideaId));

      // When
      act(() => {
        result.current.deleteMutation.mutate({ commentId: 'c-1' });
      });

      // Then
      await waitFor(() => expect(result.current.deleteMutation.isSuccess).toBe(true));

      // connectionId 포함 확인 (4번째 인자)
      expect(mockDeleteComment).toHaveBeenCalledWith(issueId, ideaId, 'c-1', connectionId);

      // 캐시 필터링 로직 검증
      expect(mockSetQueryData).toHaveBeenCalledWith(queryKey, expect.any(Function));

      const updater = mockSetQueryData.mock.calls[0][1];
      const prevData = [
        { id: 'c-1', content: 'Delete me' },
        { id: 'c-2', content: 'Keep me' },
      ];
      const nextData = updater(prevData);

      expect(nextData).toEqual([{ id: 'c-2', content: 'Keep me' }]);

      // 무효화 확인
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['issues', issueId, 'ideas', ideaId],
      });
    });
  });
});
