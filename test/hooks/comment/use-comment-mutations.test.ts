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

    test('캐시된 데이터가 없는 상태(undefined)에서도 댓글 추가가 정상적으로 동작해야 한다', async () => {
      // Given
      const newComment = { id: 'c-new', content: 'New', userId: 'user-1' };
      mockCreateComment.mockResolvedValue(newComment);

      const { result } = renderHook(() => useCommentMutations(issueId, ideaId));

      // When
      act(() => {
        result.current.createMutation.mutate({ userId: 'user-1', content: 'New' });
      });

      await waitFor(() => expect(result.current.createMutation.isSuccess).toBe(true));

      // Then: updater 함수 검증
      const updater = mockSetQueryData.mock.calls[0][1];
      // prev가 undefined여도 [newComment]가 반환되어야 함
      expect(updater(undefined)).toEqual([newComment]);
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

    test('캐시된 데이터가 없으면(undefined) 빈 배열을 반환해야 한다', async () => {
      mockUpdateComment.mockResolvedValue({ id: 'c-1', content: 'Updated' });
      const { result } = renderHook(() => useCommentMutations(issueId, ideaId));

      act(() => {
        result.current.updateMutation.mutate({ commentId: 'c-1', content: 'Updated' });
      });

      await waitFor(() => expect(result.current.updateMutation.isSuccess).toBe(true));

      const updater = mockSetQueryData.mock.calls[0][1];
      expect(updater(undefined)).toEqual([]);
    });

    test('서버 응답값에 content가 없으면 요청 시 보낸 content(variables)를 사용해야 한다', async () => {
      // Given: 서버가 수정된 시간이나 ID만 보내주고 content는 안 보내주는 상황 가정
      const serverResponse = { id: 'c-1', updatedAt: new Date() };
      mockUpdateComment.mockResolvedValue(serverResponse);

      const { result } = renderHook(() => useCommentMutations(issueId, ideaId));

      // When
      act(() => {
        result.current.updateMutation.mutate({ commentId: 'c-1', content: 'Optimistic Content' });
      });

      await waitFor(() => expect(result.current.updateMutation.isSuccess).toBe(true));

      // Then
      const updater = mockSetQueryData.mock.calls[0][1];
      const prevData = [{ id: 'c-1', content: 'Old Content' }];
      const nextData = updater(prevData);

      // 서버 응답(serverResponse)에 content가 없어도, 요청했던 'Optimistic Content'로 업데이트 되어야 함
      expect(nextData[0].content).toBe('Optimistic Content');
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

    test('캐시된 데이터가 없으면(undefined) 빈 배열을 반환해야 한다', async () => {
      mockDeleteComment.mockResolvedValue({});
      const { result } = renderHook(() => useCommentMutations(issueId, ideaId));

      act(() => {
        result.current.deleteMutation.mutate({ commentId: 'c-1' });
      });

      await waitFor(() => expect(result.current.deleteMutation.isSuccess).toBe(true));

      const updater = mockSetQueryData.mock.calls[0][1];
      // undefined가 들어와도 에러 없이 빈 배열 반환
      expect(updater(undefined)).toEqual([]);
    });
  });
});
