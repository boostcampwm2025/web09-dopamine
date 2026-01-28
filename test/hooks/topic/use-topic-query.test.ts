/**
 * @jest-environment jsdom
 */
import { useTopicDetailQuery, useTopicQuery } from '@/hooks';
import * as issueMapApi from '@/lib/api/issue-map';
import * as topicApi from '@/lib/api/topic';
import { renderHook, waitFor } from '../../utils/ui-test-helpers';

// 1. API 모킹
jest.mock('@/lib/api/issue-map');
jest.mock('@/lib/api/topic');

describe('Topic Queries', () => {
  // 모킹 함수 타입 지정
  const mockGetTopicIssues = issueMapApi.getTopicIssues as jest.Mock;
  const mockGetTopicNodes = issueMapApi.getTopicNodes as jest.Mock;
  const mockGetTopicConnections = issueMapApi.getTopicConnections as jest.Mock;
  const mockGetTopic = topicApi.getTopic as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useTopicQuery (이슈 맵 데이터)', () => {
    const topicId = 'topic-123';

    // 초기 데이터 (Server Component에서 주입받았다고 가정)
    const initialIssues = [{ id: 'issue-1', title: 'Issue 1' }] as any[];
    const initialNodes = [{ id: 'node-1', positionX: 0, positionY: 0 }] as any[];
    const initialConnections = [{ id: 'conn-1', source: 'A', target: 'B' }] as any[];

    test('initialData가 주어지면 API 호출 없이 초기 데이터를 즉시 반환해야 한다', () => {
      // API가 호출되지 않아야 함을 검증하기 위해 Mock 설정은 하되 호출 여부만 확인
      mockGetTopicIssues.mockResolvedValue([]);

      const { result } = renderHook(() =>
        useTopicQuery(topicId, initialIssues, initialNodes, initialConnections),
      );

      // 1. 초기 데이터가 바로 반환되는지 확인 (React Query의 initialData 작동 확인)
      expect(result.current.issues).toEqual(initialIssues);
      expect(result.current.nodes).toEqual(initialNodes);
      expect(result.current.connections).toEqual(initialConnections);

      // 2. isLoading은 false여야 함 (데이터가 이미 있으므로)
      expect(result.current.isLoading).toBe(false);

      // 3. staleTime: Infinity 이므로 컴포넌트 마운트 시 API가 호출되지 않아야 함
      expect(mockGetTopicIssues).not.toHaveBeenCalled();
      expect(mockGetTopicNodes).not.toHaveBeenCalled();
      expect(mockGetTopicConnections).not.toHaveBeenCalled();
    });

    test('데이터가 없는 경우 빈 배열을 반환해야 한다', () => {
      // 초기 데이터로 빈 배열 주입
      const { result } = renderHook(() => useTopicQuery(topicId, [], [], []));

      expect(result.current.issues).toEqual([]);
      expect(result.current.nodes).toEqual([]);
      expect(result.current.connections).toEqual([]);
    });
  });

  describe('useTopicDetailQuery (토픽 상세)', () => {
    const topicId = 'topic-123';
    const mockTopicData = { id: topicId, title: 'My Topic', projectId: 'proj-1' };

    test('토픽 상세 정보를 API를 통해 가져와야 한다', async () => {
      // Given: API 성공 응답 설정
      mockGetTopic.mockResolvedValue(mockTopicData);

      // When
      const { result } = renderHook(() => useTopicDetailQuery(topicId));

      // Then: 데이터 로딩 대기
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // 1. 데이터 확인
      expect(result.current.data).toEqual(mockTopicData);

      // 2. API가 올바른 ID로 호출되었는지 확인
      expect(mockGetTopic).toHaveBeenCalledWith(topicId);
    });
  });
});
