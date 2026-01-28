/**
 * @jest-environment jsdom
 */
import { useIssueQuery, useTopicIssuesQuery } from '@/hooks';
import * as issueApi from '@/lib/api/issue';
import * as issueMapApi from '@/lib/api/issue-map';
import { renderHook, waitFor } from '../../utils/test-utils';

// 1. API 모듈 모킹
jest.mock('@/lib/api/issue');
jest.mock('@/lib/api/issue-map');

describe('Issue & Topic Queries', () => {
  // Mock 함수들
  const mockGetIssue = issueApi.getIssue as jest.Mock;
  const mockGetTopicIssues = issueMapApi.getTopicIssues as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. useIssueQuery (단일 이슈 조회)
  describe('useIssueQuery', () => {
    const issueId = 'issue-123';

    test('정상적인 조건(ID 있음, Enabled=true)에서 이슈 정보를 가져와야 한다', async () => {
      // Given
      const mockIssue = { id: issueId, title: 'Test Issue', status: 'OPEN' };
      mockGetIssue.mockResolvedValue(mockIssue);

      // When
      const { result } = renderHook(() => useIssueQuery(issueId));

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockIssue);
      expect(mockGetIssue).toHaveBeenCalledWith(issueId);
    });

    test('enabled가 false인 경우 API를 호출하지 않아야 한다', () => {
      // Given
      // When: issueId는 있지만 enabled가 false
      const { result } = renderHook(() => useIssueQuery(issueId, false));

      // Then
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockGetIssue).not.toHaveBeenCalled();
    });

    test('issueId가 없는 경우(빈 문자열) API를 호출하지 않아야 한다', () => {
      // Given
      // When: issueId가 빈 문자열 (enabled는 기본값 true)
      const { result } = renderHook(() => useIssueQuery(''));

      // Then
      // enabled: enabled && !!issueId 조건에 의해 false가 됨
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockGetIssue).not.toHaveBeenCalled();
    });
  });

  // 2. useTopicIssuesQuery (토픽 내 이슈 목록 조회)
  describe('useTopicIssuesQuery', () => {
    const topicId = 'topic-123';

    test('유효한 topicId가 주어지면 이슈 목록을 가져와야 한다', async () => {
      // Given
      const mockIssues = [
        { id: 'issue-1', title: 'Issue 1' },
        { id: 'issue-2', title: 'Issue 2' },
      ];
      mockGetTopicIssues.mockResolvedValue(mockIssues);

      // When
      const { result } = renderHook(() => useTopicIssuesQuery(topicId));

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockIssues);
      expect(mockGetTopicIssues).toHaveBeenCalledWith(topicId);
    });

    test('topicId가 없는 경우(null/undefined) API를 호출하지 않아야 한다', () => {
      // Given
      // When: topicId가 null
      const { result } = renderHook(() => useTopicIssuesQuery(null));

      // Then
      // enabled: !!topicId 조건에 의해 false
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockGetTopicIssues).not.toHaveBeenCalled();
    });
  });
});
