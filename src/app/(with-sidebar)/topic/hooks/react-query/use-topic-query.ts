import { useQuery } from '@tanstack/react-query';
import type { IssueConnection, IssueMapData, IssueNode } from '@/types/issue';

// 실제로는 API에서 가져와야 하지만, 현재는 초기 데이터 사용
export const useTopicQuery = (
  topicId: string,
  initialIssues: IssueMapData[],
  initialNodes: IssueNode[],
  initialConnections: IssueConnection[],
) => {
  const issuesQuery = useQuery({
    queryKey: ['topics', topicId, 'issues'],
    queryFn: async () => initialIssues,
    initialData: initialIssues,
    staleTime: Infinity, // 서버에서 받은 데이터를 신뢰
  });

  const nodesQuery = useQuery({
    queryKey: ['topics', topicId, 'nodes'],
    queryFn: async () => initialNodes,
    initialData: initialNodes,
    staleTime: Infinity,
  });

  const connectionsQuery = useQuery({
    queryKey: ['topics', topicId, 'connections'],
    queryFn: async () => initialConnections,
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
