/**
 * @jest-environment jsdom
 */
import {
  getCommentCountQueryKey,
  getCommentQueryKey,
  useCommentCountQuery,
  useCommentQuery,
} from '@/hooks';
import * as commentApi from '@/lib/api/comment';
import { renderHook, waitFor } from '../../utils/ui-test-helpers';

// 1. API 모킹
jest.mock('@/lib/api/comment');

describe('Comment Queries', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  // Mock 함수들
  const mockFetchComments = commentApi.fetchComments as jest.Mock;
  const mockFetchCommentCount = commentApi.fetchCommentCount as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ 1. 유틸리티 함수(Query Key Generator) 테스트
  describe('Query Key Generators', () => {
    test('getCommentQueryKey가 올바른 배열을 반환해야 한다', () => {
      const key = getCommentQueryKey(issueId, ideaId);
      expect(key).toEqual(['comments', issueId, ideaId]);
    });

    test('getCommentCountQueryKey가 올바른 배열을 반환해야 한다', () => {
      const key = getCommentCountQueryKey(issueId, ideaId);
      expect(key).toEqual(['comments', issueId, ideaId, 'count']);
    });
  });

  // ✅ 2. useCommentQuery (댓글 목록 조회) 테스트
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
      // 쿼리 키 확인 (hooks에서 반환된 키가 맞는지)
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

  // ✅ 3. useCommentCountQuery (댓글 개수 조회) 테스트
  describe('useCommentCountQuery', () => {
    test('유효한 ID가 주어지면 댓글 개수를 가져와야 한다', async () => {
      // Given
      const mockCount = 5;
      mockFetchCommentCount.mockResolvedValue(mockCount);

      // When
      const { result } = renderHook(() => useCommentCountQuery(issueId, ideaId));

      // Then
      await waitFor(() => expect(result.current.commentCountQuery.isSuccess).toBe(true));

      // 데이터 확인
      expect(result.current.commentCountQuery.data).toEqual(mockCount);
      // 쿼리 키 확인
      expect(result.current.commentCountQueryKey).toEqual(['comments', issueId, ideaId, 'count']);
      // API 호출 확인
      expect(mockFetchCommentCount).toHaveBeenCalledWith(issueId, ideaId);
    });

    test('ID가 없는 경우 API를 호출하지 않아야 한다', () => {
      // Given
      // When: issueId만 있고 ideaId가 없는 경우
      const { result } = renderHook(() => useCommentCountQuery(issueId, ''));

      // Then
      expect(result.current.commentCountQuery.fetchStatus).toBe('idle');
      expect(mockFetchCommentCount).not.toHaveBeenCalled();
    });
  });
});
