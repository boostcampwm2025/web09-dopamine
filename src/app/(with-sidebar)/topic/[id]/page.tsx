import { topicService } from '@/lib/services/topic.service';
import TopicCanvas from '../_components/topic-canvas';

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: topicId } = await params;

  // 토픽 ID로 이슈 맵 데이터 불러오기
  const { issues, nodes, connections } = await topicService.getIssuesMapData(topicId);

  return (
    <TopicCanvas topicId={topicId} issues={issues} nodes={nodes} connections={connections} />
  );
}
