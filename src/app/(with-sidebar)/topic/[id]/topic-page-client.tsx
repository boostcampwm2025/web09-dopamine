'use client';

import { useTopicQuery } from '@/hooks/topic';
import { useTopicEvents } from '@/hooks/topic/use-topic-events';
import { IssueConnection, IssueMapData, IssueNode } from '@/types/issue';
import IssueNodeSkeletonGrid from '../_components/issue-node-skeleton-grid/issue-node-skeleton-grid';
import TopicCanvas from '../_components/topic-canvas/topic-canvas';

interface TopicPageClientProps {
  topicId: string;
  initialIssues: IssueMapData[];
  initialNodes: IssueNode[];
  initialConnections: IssueConnection[];
}

export default function TopicPageClient({
  topicId,
  initialIssues,
  initialNodes,
  initialConnections,
}: TopicPageClientProps) {
  // 토픽 실시간 이벤트 수신 (이슈가 0개여도 항상 활성화)
  useTopicEvents({ topicId });

  const { issues, nodes, connections } = useTopicQuery(
    topicId,
    initialIssues,
    initialNodes,
    initialConnections,
  );

  // 이슈가 없으면 스켈레톤 그리드 표시
  if (issues.length === 0) {
    return <IssueNodeSkeletonGrid />;
  }

  // 이슈가 있으면 토픽 캔버스 표시
  return <TopicCanvas topicId={topicId} issues={issues} nodes={nodes} connections={connections} />;
}
