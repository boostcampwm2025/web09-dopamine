import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import { sseManager } from '@/lib/sse/sse-manager';
import { createErrorResponse } from '@/lib/utils/api-helpers';
import { getUserIdFromRequest } from '@/lib/utils/cookie';

export const dynamic = 'force-dynamic';

/**
 * SSE 엔드포인트
 * GET /api/issues/[id]/events
 *
 * 특정 이슈에 대한 실시간 이벤트 스트림을 제공
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ issueId: string }> }) {
  const { issueId } = await params;
  // AbortSignal 객체 추출
  const { signal } = request;

  /**
   * 이슈 쿠키가 있으면 익명 참여(빠른 이슈)로 우선 처리
   */
  const session = await getServerSession(authOptions);
  const issueUserId = getUserIdFromRequest(request, issueId);
  const userId = issueUserId ?? session?.user?.id;

  if (!userId) {
    return createErrorResponse('USER_ID_REQUIRED', 401);
  }

  // SSE 스트림 생성
  const stream = sseManager.createStream({
    issueId,
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
