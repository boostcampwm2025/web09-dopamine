import { notFound } from 'next/navigation';
import { findTopicById } from '@/lib/repositories/topic.repository';
import { topicService } from '@/lib/services/topic.service';
import IssueNodeSkeletonGrid from '../_components/issue-node-skeleton-grid/issue-node-skeleton-grid';
import TopicCanvas from '../_components/topic-canvas/topic-canvas';

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: topicId } = await params;

  const topic = await findTopicById(topicId);
  if (!topic) {
    notFound();
  }

  // 토픽 ID로 이슈 맵 데이터 불러오기
  const { issues, nodes, connections } = await topicService.getIssuesMapData(topicId);

  if (issues.length === 0) {
    return <IssueNodeSkeletonGrid />;
  }

  return (
    <TopicCanvas
      topicId={topicId}
      issues={issues}
      nodes={nodes}
      connections={connections}
    />
  );
}
