import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { authOptions } from '@/lib/auth';
import { voteService } from '@/lib/services/vote.service';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { getUserIdFromRequest } from '@/lib/utils/cookie';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string; ideaId: string }> },
) {
  try {
    const { issueId, ideaId } = await params;
    const { voteType } = await req.json();
    const actorConnectionId = req.headers.get('x-sse-connection-id') || undefined;

    // 1. 세션에서 userId 확인 (OAuth 로그인 사용자)
    const session = await getServerSession(authOptions);
    let userId: string | null = session?.user?.id ?? null;

    // 2. 세션이 없으면 쿠키에서 확인 (익명 사용자 - 빠른 이슈)
    if (!userId) {
      userId = getUserIdFromRequest(req, issueId) ?? null;
    }

    if (!userId || !voteType) {
      return createErrorResponse('INVALID_VOTE_REQUEST', 400);
    }

    const result = await voteService.castVote(ideaId, userId, voteType);

    // 아이디어가 존재하는 경우 아이디어의 상태를 브로드캐스트
    if (issueId) {
      broadcast({
        issueId: issueId,
        excludeConnectionId: actorConnectionId,
        event: {
          type: SSE_EVENT_TYPES.VOTE_CHANGED,
          data: {
            ideaId,
            agreeCount: result.agreeCount,
            disagreeCount: result.disagreeCount,
          },
        },
      });
    }

    return createSuccessResponse(result);
  } catch (error) {
    console.error('투표 실패:', error);
    return createErrorResponse('VOTE_FAILED', 500);
  }
}
