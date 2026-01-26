import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import { sseManager } from '@/lib/sse/sse-manager';
import { createErrorResponse } from '@/lib/utils/api-helpers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const { signal } = request;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return createErrorResponse('USER_ID_REQUIRED', 401);
  }

  // 토픽용 SSE 스트림 생성
  const stream = sseManager.createTopicStream({
    topicId,
    userId,
    signal,
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
