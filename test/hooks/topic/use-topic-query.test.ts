/**
 * @jest-environment jsdom
 */
import { useTopicDetailQuery, useTopicQuery } from '@/hooks';
import * as issueMapApi from '@/lib/api/issue-map';
import * as topicApi from '@/lib/api/topic';
import { renderHook, waitFor } from '../../utils/test-utils';

// 1. API 모킹
jest.mock('@/lib/api/issue-map');
jest.mock('@/lib/api/topic');

describe('Topic Queries', () => {
  const mockGetTopicIssues = issueMapApi.getTopicIssues as jest.Mock;
  const mockGetTopicNodes = issueMapApi.getTopicNodes as jest.Mock;
  const mockGetTopicConnections = issueMapApi.getTopicConnections as jest.Mock;
  const mockGetTopic = topicApi.getTopic as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useTopicQuery (이슈 맵 데이터)', () => {
    const topicId = 'topic-123';
    const initialIssues = [{ id: 'issue-1', title: 'Issue 1' }] as any[];
    const initialNodes = [{ id: 'node-1', positionX: 0, positionY: 0 }] as any[];
    const initialConnections = [{ id: 'conn-1', source: 'A', target: 'B' }] as any[];

    test('initialData가 주어지면 API 호출 없이 초기 데이터를 반환해야 한다', () => {
      // Given
      const { result } = renderHook(() =>
        useTopicQuery(topicId, initialIssues, initialNodes, initialConnections),
      );

      // Then
      expect(result.current.issues).toEqual(initialIssues);
      expect(result.current.nodes).toEqual(initialNodes);
      expect(result.current.connections).toEqual(initialConnections);
      expect(result.current.isLoading).toBe(false);

      // API 호출 안 함
      expect(mockGetTopicIssues).not.toHaveBeenCalled();
    });

    // nitialData가 없을 때 (undefined) -> 로딩 상태 및 빈 배열 반환 확인
    // 이 테스트가 `data ?? []` 분기와 `isLoading` 로직을 커버합니다.
    test('initialData가 없으면(undefined) 로딩 상태가 true이고, 데이터는 빈 배열로 안전하게 처리되어야 한다', async () => {
      // Given: API 호출이 발생하므로(initialData가 없어서) 지연 응답 설정
      mockGetTopicIssues.mockImplementation(() => new Promise(() => {})); // 영원히 대기 (Loading 상태 유지)
      mockGetTopicNodes.mockImplementation(() => new Promise(() => {}));
      mockGetTopicConnections.mockImplementation(() => new Promise(() => {}));

      // When: initialData에 undefined 주입 (as any로 타입 우회)
      const { result } = renderHook(() =>
        useTopicQuery(topicId, undefined as any, undefined as any, undefined as any),
      );

      // Then
      // 1. 로딩 상태 확인 (하나라도 로딩이면 true)
      expect(result.current.isLoading).toBe(true);

      // 2. 데이터가 로딩 중(undefined)일 때 `?? []` 처리가 동작하는지 확인
      expect(result.current.issues).toEqual([]);
      expect(result.current.nodes).toEqual([]);
      expect(result.current.connections).toEqual([]);
    });

    // 데이터가 빈 배열([])로 들어왔을 때도 정상 처리 확인
    test('데이터가 빈 배열([])인 경우 그대로 빈 배열을 반환해야 한다', () => {
      const { result } = renderHook(() => useTopicQuery(topicId, [], [], []));

      expect(result.current.issues).toEqual([]);
      expect(result.current.nodes).toEqual([]);
      expect(result.current.connections).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useTopicDetailQuery (토픽 상세)', () => {
    const topicId = 'topic-123';
    const mockTopicData = { id: topicId, title: 'My Topic', projectId: 'proj-1' };

    test('성공 시 토픽 상세 정보를 반환해야 한다', async () => {
      mockGetTopic.mockResolvedValue(mockTopicData);

      const { result } = renderHook(() => useTopicDetailQuery(topicId));

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockTopicData);
    });

    // 에러 발생 시 처리
    test('API 에러 발생 시 isError가 true가 되어야 한다', async () => {
      // Given
      mockGetTopic.mockRejectedValue(new Error('Fetch Failed'));

      const { result } = renderHook(() => useTopicDetailQuery(topicId));

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });
});
