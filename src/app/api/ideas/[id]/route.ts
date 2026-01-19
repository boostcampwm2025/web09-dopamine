import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    //TODO: userId 전달 방식 수정 필요
    const userId = req.headers.get('x-user-id');

    const idea = await prisma.idea.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!idea) {
      return createErrorResponse('IDEA_NOT_FOUND', 404);
    }

    const myVote = userId
      ? await prisma.vote.findFirst({ where: { ideaId: id, userId, deletedAt: null } })
      : null;

    return createSuccessResponse({
      ...idea,
      agreeCount: idea.agreeCount,
      disagreeCount: idea.disagreeCount,
      myVote: myVote?.type ?? null,
    });
  } catch (error) {
    console.error('아이디어 상세 조회 실패:', error);
    return createErrorResponse('IDEA_DETAIL_FETCH_FAILED', 500);
  }
}
