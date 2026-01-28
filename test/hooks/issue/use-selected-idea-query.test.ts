/**
 * @jest-environment jsdom
 */
import { selectedIdeaQueryKey, useSelectedIdeaQuery } from '@/hooks';
import { renderHook } from '../../utils/ui-test-helpers';

describe('useSelectedIdeaQuery', () => {
  const issueId = 'issue-123';

  // 1. 유틸리티 함수(Query Key) 테스트
  describe('selectedIdeaQueryKey', () => {
    test('일관된 배열 형태의 쿼리 키를 반환해야 한다', () => {
      const key = selectedIdeaQueryKey(issueId);

      // 다른 컴포넌트나 Mutation에서 이 키를 참조하므로 정확해야 함
      expect(key).toEqual(['issues', issueId, 'selected-idea']);
    });
  });

  // 2. Hook 동작 테스트
  describe('Hook Behavior', () => {
    test('초기 데이터는 null이어야 하며, 자동으로 API를 호출(Fetch)하지 않아야 한다', () => {
      // Given & When
      const { result } = renderHook(() => useSelectedIdeaQuery(issueId));

      // Then
      // 1. 초기 데이터 확인 (initialData: null 설정 확인)
      expect(result.current.data).toBeNull();

      // 2. Fetch 상태 확인 (enabled: false 설정 확인)
      // fetchStatus가 'idle'이어야 네트워크 요청을 안 하고 있다는 뜻
      expect(result.current.fetchStatus).toBe('idle');
    });

    test('staleTime 등의 설정과 무관하게 항상 초기 상태를 유지해야 한다', () => {
      // React Query의 Client State 패턴에서는
      // 명시적인 setQueryData 없이는 상태가 변하지 않아야 함
      const { result } = renderHook(() => useSelectedIdeaQuery(issueId));

      expect(result.current.data).toBe(null);
      expect(result.current.isLoading).toBe(false); // initialData가 있으므로 로딩 아님
      expect(result.current.isSuccess).toBe(true); // 데이터(null)가 있으므로 성공 상태
    });
  });
});
