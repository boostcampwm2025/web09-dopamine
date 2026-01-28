/**
 * @jest-environment jsdom
 */
import { useIssueMemberQuery } from '@/hooks';
import * as issueApi from '@/lib/api/issue';
import { renderHook, waitFor } from '../../utils/ui-test-helpers';

// 1. API 모킹
jest.mock('@/lib/api/issue');

describe('useIssueMemberQuery', () => {
  const issueId = 'issue-123';
  const mockGetIssueMembers = issueApi.getIssueMembers as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('정상적인 조건(ID 있음, Enabled=true)에서 멤버 목록을 가져와야 한다', async () => {
    // Given
    const mockMembers = [
      { userId: 'user-1', nickname: 'Alice', joinedAt: '2024-01-01' },
      { userId: 'user-2', nickname: 'Bob', joinedAt: '2024-01-02' },
    ];
    mockGetIssueMembers.mockResolvedValue(mockMembers);

    // When (enabled 기본값은 true)
    const { result } = renderHook(() => useIssueMemberQuery(issueId));

    // Then
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockMembers);
    expect(mockGetIssueMembers).toHaveBeenCalledWith(issueId);
  });

  test('enabled가 false로 설정되면 API를 호출하지 않아야 한다', () => {
    // Given
    // When: enabled = false 전달
    const { result } = renderHook(() => useIssueMemberQuery(issueId, false));

    // Then
    // fetchStatus가 'idle'이어야 함 (요청을 안 날림)
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetIssueMembers).not.toHaveBeenCalled();
  });

  test('issueId가 없는 경우(빈 문자열) API를 호출하지 않아야 한다', () => {
    // Given
    // When: issueId = '' (enabled는 true여도)
    const { result } = renderHook(() => useIssueMemberQuery('', true));

    // Then
    // enabled: enabled && !!issueId 조건에 의해 false가 되어야 함
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetIssueMembers).not.toHaveBeenCalled();
  });
});
