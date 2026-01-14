import { NextRequest } from 'next/server';
import { sseManager } from '@/lib/sse/sse-manager';

export const dynamic = 'force-dynamic';

/**
 * SSE 엔드포인트
 * GET /api/issues/[id]/events
 *
 * 특정 이슈에 대한 실시간 이벤트 스트림을 제공
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const issueId = params.id;
  // AbortSignal 객체 추출
  const { signal } = request;

  /**
   * @todo Session 혹은 JWT 등에서 사용자 정보를 받아오도록 수정 필요
   * 임시로 x-user-id 헤더에 담아서 보내도록 함
   */
  const userId = request.headers.get('x-user-id');

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
