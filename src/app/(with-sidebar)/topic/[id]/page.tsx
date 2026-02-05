import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { findTopicById } from '@/lib/repositories/topic.repository';
import { topicService } from '@/lib/services/topic.service';
import TopicPageClient from './topic-page-client';

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: topicId } = await params;

  // 세션 확인
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/');
  }

  const topic = await findTopicById(topicId);
  if (!topic) {
    notFound();
  }

  // 토픽 접근 권한 확인
  try {
    await topicService.checkTopicAccess(topicId, session.user.id);
  } catch (error) {
    redirect('/');
  }

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
