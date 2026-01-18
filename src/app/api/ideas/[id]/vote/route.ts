import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { prisma } from '@/lib/prisma';
import { voteService } from '@/lib/services/vote.service';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: ideaId } = await params;
    const { userId, voteType } = await req.json();

    if (!userId || !voteType) {
      return createErrorResponse('INVALID_VOTE_REQUEST', 400);
    }

    const result = await voteService.castVote(ideaId, userId, voteType);

    // 투표한 아이디어를 DB에서 조회
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      select: { issueId: true },
    });

    // 아이디어가 존재하는 경우 아이디어의 상태를 브로드캐스트
    if (idea?.issueId) {
      broadcast({
        issueId: idea.issueId,
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
