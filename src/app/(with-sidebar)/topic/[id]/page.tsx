import { topicService } from '@/lib/services/topic.service';
import TopicPageClient from './topic-page-client';

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: topicId } = await params;

  // 토픽 ID로 이슈 맵 데이터 불러오기 (초기 데이터)
  const { issues, nodes, connections } = await topicService.getIssuesMapData(topicId);

  return (
    <TopicPageClient
      topicId={topicId}
      initialIssues={issues}
      initialNodes={nodes}
      initialConnections={connections}
    />
  );
}
