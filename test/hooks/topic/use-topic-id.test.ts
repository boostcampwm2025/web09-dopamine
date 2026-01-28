/**
 * @jest-environment jsdom
 */
import { useParams, usePathname } from 'next/navigation';
import { renderHook } from '@test/utils/ui-test-helpers';
import { useIssueQuery, useTopicId } from '@/hooks';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/hooks/issue', () => ({
  useIssueQuery: jest.fn(),
}));

const mockUseParams = useParams as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;
const mockUseIssueQuery = useIssueQuery as jest.Mock;

describe('useTopicId Hook', () => {
  // 각 테스트 실행 전에 모킹 초기화 (이전 테스트 결과가 남지 않도록)
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('토픽 페이지 (/topic)인 경우', () => {
    test('URL 파라미터(params.id)에서 topicId를 가져와야 한다', () => {
      // Given: 토픽 페이지 URL과 파라미터 설정
      mockUsePathname.mockReturnValue('/topic/123');
      mockUseParams.mockReturnValue({ id: '123' });
      // 이슈 쿼리는 실행되더라도 데이터가 없다고 가정 (또는 enabled: false라 실행 안 됨)
      mockUseIssueQuery.mockReturnValue({ data: undefined });

      // When: 훅 실행
      const { result } = renderHook(() => useTopicId());

      // Then
      expect(result.current.isTopicPage).toBe(true);
      expect(result.current.topicId).toBe('123');
    });

    test('useIssueQuery는 비활성화 되어야 한다', () => {
      mockUsePathname.mockReturnValue('/topic/123');
      mockUseParams.mockReturnValue({ id: 'topic-123' });

      mockUseIssueQuery.mockReturnValue({ data: undefined });

      renderHook(() => useTopicId());

      expect(mockUseIssueQuery).toHaveBeenCalledWith(expect.anything(), false);
    });
  });

  describe('이슈 페이지 (토픽 페이지 아님)인 경우', () => {
    test('URL 파라미터는 무시하고, useIssueQuery의 결과에서 topicId를 가져와야 한다', () => {
      // Given: 이슈 페이지 URL (여기서 id는 이슈 ID임)
      mockUsePathname.mockReturnValue('/issue/999');
      mockUseParams.mockReturnValue({ id: '999' });

      // useIssueQuery가 topicId가 포함된 이슈 데이터를 반환하도록 설정
      mockUseIssueQuery.mockReturnValue({
        data: { topicId: '555', title: '이슈 제목' },
      });

      // When
      const { result } = renderHook(() => useTopicId());

      // Then
      expect(result.current.isTopicPage).toBe(false);
      expect(result.current.topicId).toBe('555');
    });

    test('이슈 데이터를 아직 불러오지 못했으면 topicId는 undefined여야 한다', () => {
      // Given
      mockUsePathname.mockReturnValue('/issue/999');
      mockUseParams.mockReturnValue({ id: '999' });
      // 데이터 로딩 중 (data: undefined)
      mockUseIssueQuery.mockReturnValue({ data: undefined });

      // When
      const { result } = renderHook(() => useTopicId());

      // Then
      expect(result.current.topicId).toBeUndefined();
    });

    test('올바른 issueId로 쿼리를 호출해야 한다', () => {
      mockUsePathname.mockReturnValue('/issue/999');
      mockUseParams.mockReturnValue({ id: '999' });
      mockUseIssueQuery.mockReturnValue({ data: undefined });

      renderHook(() => useTopicId());

      // useIssueQuery가 issue '999'와 true(enabled)로 호출되었는지 검증
      expect(mockUseIssueQuery).toHaveBeenCalledWith('999', true);
    });
  });
});
