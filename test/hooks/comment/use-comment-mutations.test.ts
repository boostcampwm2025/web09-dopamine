/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { getCommentQueryKey, useCommentMutations } from '@/hooks';
import * as commentApi from '@/lib/api/comment';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 의존성 모킹
jest.mock('@/lib/api/comment');
jest.mock('@/hooks/comment/use-comment-query');

// 2. React Query의 useQueryClient 모킹
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

describe('useCommentMutations', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';
  const queryKey = ['comments', issueId, ideaId]; // 테스트용 키

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

    // useQueryClient 설정
    (useQueryClient as jest.Mock).mockReturnValue({
      setQueryData: mockSetQueryData,
      invalidateQueries: mockInvalidateQueries,
    });

    // 쿼리 키 유틸 설정
    mockGetCommentQueryKey.mockReturnValue(queryKey);
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

      // 1. API 호출 확인
      expect(mockCreateComment).toHaveBeenCalledWith(issueId, ideaId, {
        userId: 'user-1',
        content: 'New Comment',
      });

      // 2. setQueryData가 함수형 업데이트로 호출되었는지 확인하고, 그 로직 검증
      // 호출 인자 확인: (Key, UpdaterFunction)
      expect(mockSetQueryData).toHaveBeenCalledWith(queryKey, expect.any(Function));

      // Updater 함수를 직접 실행해서 로직 검증 (기존 배열에 잘 추가되는지)
      const updater = mockSetQueryData.mock.calls[0][1];
      const prevData = [{ id: 'c-old', content: 'Old' }];
      const nextData = updater(prevData);

      expect(nextData).toEqual([...prevData, newComment]); // 기존 + 새것

      // 3. 아이디어 쿼리(댓글 수 갱신용) 무효화 확인
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

      expect(mockUpdateComment).toHaveBeenCalledWith(issueId, ideaId, 'c-1', {
        content: 'Updated Content',
      });

      // 캐시 업데이트 로직 검증
      expect(mockSetQueryData).toHaveBeenCalledWith(queryKey, expect.any(Function));

      const updater = mockSetQueryData.mock.calls[0][1];
      const prevData = [
        { id: 'c-1', content: 'Original' }, // 수정 대상
        { id: 'c-2', content: 'Other' }, // 유지 대상
      ];
      const nextData = updater(prevData);

      expect(nextData).toEqual([
        { id: 'c-1', content: 'Updated Content' }, // 변경됨
        { id: 'c-2', content: 'Other' }, // 그대로
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

      expect(mockDeleteComment).toHaveBeenCalledWith(issueId, ideaId, 'c-1');

      // 캐시 필터링 로직 검증
      expect(mockSetQueryData).toHaveBeenCalledWith(queryKey, expect.any(Function));

      const updater = mockSetQueryData.mock.calls[0][1];
      const prevData = [
        { id: 'c-1', content: 'Delete me' }, // 삭제 대상
        { id: 'c-2', content: 'Keep me' }, // 유지 대상
      ];
      const nextData = updater(prevData);

      expect(nextData).toEqual([
        { id: 'c-2', content: 'Keep me' }, // c-1이 사라져야 함
      ]);

      // 아이디어 쿼리(댓글 수 갱신용) 무효화 확인
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['issues', issueId, 'ideas', ideaId],
      });
    });
  });
});
