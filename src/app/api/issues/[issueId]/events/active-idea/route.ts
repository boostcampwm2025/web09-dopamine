import { NextRequest, NextResponse } from 'next/server';
import { updateActiveIdea } from '@/lib/sse/sse-service';
import { createErrorResponse } from '@/lib/utils/api-helpers';

/**
 * 활성 아이디어 업데이트 엔드포인트
 * PATCH /api/issues/[issueId]/events/active-idea
 *
 * 클라이언트가 현재 보고 있는 아이디어 댓글창 정보를 서버에 등록
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
) {
  try {
    const { issueId } = await params;
    const { connectionId, ideaId } = await request.json();

    if (!connectionId) {
      return createErrorResponse('CONNECTION_ID_REQUIRED', 400);
    }

    // sse-service를 통해 SSEManager의 상태 업데이트
    updateActiveIdea(issueId, connectionId, ideaId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Failed to update active idea:', error);
    return createErrorResponse('INTERNAL_SERVER_ERROR', 500);
  }
}
