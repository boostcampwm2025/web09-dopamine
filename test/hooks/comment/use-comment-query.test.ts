/**
 * @jest-environment jsdom
 */
import { getCommentQueryKey, useCommentQuery } from '@/hooks';
import * as commentApi from '@/lib/api/comment';
import { renderHook, waitFor } from '../../utils/test-utils';

// 1. API 모킹
jest.mock('@/lib/api/comment');

describe('Comment Queries', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  // Mock 함수들
  const mockFetchComments = commentApi.fetchComments as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. 유틸리티 함수(Query Key Generator) 테스트
  describe('Query Key Generators', () => {
    test('getCommentQueryKey가 올바른 배열을 반환해야 한다', () => {
      const key = getCommentQueryKey(issueId, ideaId);
      expect(key).toEqual(['comments', issueId, ideaId]);
    });
  });

  // 2. useCommentQuery (댓글 목록 조회) 테스트
  describe('useCommentQuery', () => {
    test('유효한 ID가 주어지면 댓글 목록을 가져와야 한다', async () => {
      // Given
      const mockComments = [
        { id: 'c1', content: 'comment 1' },
        { id: 'c2', content: 'comment 2' },
      ];
      mockFetchComments.mockResolvedValue(mockComments);

      // When
      const { result } = renderHook(() => useCommentQuery(issueId, ideaId));

      // Then
      await waitFor(() => expect(result.current.commentsQuery.isSuccess).toBe(true));

      // 데이터 확인
      expect(result.current.commentsQuery.data).toEqual(mockComments);
      // 쿼리 키 확인
      expect(result.current.commentQueryKey).toEqual(['comments', issueId, ideaId]);
      // API 호출 확인
      expect(mockFetchComments).toHaveBeenCalledWith(issueId, ideaId);
    });

    test('ID가 없는 경우 API를 호출하지 않아야 한다 (enabled: false)', () => {
      // Given
      // When: 빈 문자열 전달
      const { result } = renderHook(() => useCommentQuery('', ''));

      // Then
      // fetchStatus가 'idle'(대기) 상태여야 함
      expect(result.current.commentsQuery.fetchStatus).toBe('idle');
      expect(mockFetchComments).not.toHaveBeenCalled();
    });
  });
});
