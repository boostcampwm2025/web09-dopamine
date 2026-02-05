import { useQuery } from '@tanstack/react-query';
import { getTopicConnections, getTopicIssues, getTopicNodes } from '@/lib/api/issue-map';
import { getTopic } from '@/lib/api/topic';
import { ApiError } from '@/lib/utils/api-response';
import type { IssueConnection, IssueMapData, IssueNode } from '@/types/issue';

// 초기 데이터는 서버 컴포넌트에서 주입하고, 필요 시 API로 갱신
export const useTopicQuery = (
  topicId: string,
  initialIssues: IssueMapData[],
  initialNodes: IssueNode[],
  initialConnections: IssueConnection[],
) => {
  const issuesQuery = useQuery({
    queryKey: ['topics', topicId, 'issues'],
    queryFn: () => getTopicIssues(topicId),
    initialData: initialIssues,
    staleTime: Infinity, // 서버에서 받은 데이터를 신뢰
  });

  const nodesQuery = useQuery({
    queryKey: ['topics', topicId, 'nodes'],
    queryFn: () => getTopicNodes(topicId),
    initialData: initialNodes,
    staleTime: Infinity,
  });

  const connectionsQuery = useQuery({
    queryKey: ['topics', topicId, 'connections'],
    queryFn: () => getTopicConnections(topicId),
    initialData: initialConnections,
    staleTime: Infinity,
  });

  return {
    issues: issuesQuery.data ?? [],
    nodes: nodesQuery.data ?? [],
    connections: connectionsQuery.data ?? [],
    isLoading: issuesQuery.isLoading || nodesQuery.isLoading || connectionsQuery.isLoading,
  };
};

// 토픽 상세 정보 조회
export const useTopicDetailQuery = (topicId: string) => {
  return useQuery({
    queryKey: ['topics', topicId],
    queryFn: () => getTopic(topicId),
    staleTime: 1000 * 10,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.code === 'TOPIC_NOT_FOUND') return false;
      return failureCount < 3;
    },
  });
};
