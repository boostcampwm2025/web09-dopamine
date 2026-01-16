import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { prisma } from '@/lib/prisma';
import { voteService } from '@/lib/services/vote.service';
import { broadcast } from '@/lib/sse/sse-service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: ideaId } = await params;
    const { userId, voteType } = await req.json();

    if (!userId || !voteType) {
      return NextResponse.json({ message: '잘못된 요청입니다.' }, { status: 400 });
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('투표 실패:', error);
    return NextResponse.json({ message: '투표 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
