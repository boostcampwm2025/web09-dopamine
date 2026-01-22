import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { prisma } from '@/lib/prisma';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { getUserIdFromRequest } from '@/lib/utils/cookie';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ideaId: string }> },
) {
  try {
    const { id: issueId, ideaId } = await params;

    const userId = getUserIdFromRequest(req, issueId);

    const idea = await prisma.idea.findUnique({
      where: {
        id: ideaId,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
        comments: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!idea) {
      return createErrorResponse('IDEA_NOT_FOUND', 404);
    }

    const myVote = userId
      ? await prisma.vote.findFirst({ where: { ideaId: ideaId, userId, deletedAt: null } })
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ideaId: string }> },
): Promise<NextResponse> {
  const { id: issueId, ideaId } = await params;

  if (!ideaId) {
    return createErrorResponse('IDEA_ID_REQUIRED', 400);
  }

  try {
    // 본인 아이디어가 아니라면, 삭제를 방지해야함
    // 아직 인증/인가 로직이 없으므로 생략

    await ideaRepository.softDelete(ideaId);

    // SSE 브로드캐스팅: 아이디어 삭제 이벤트
    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.IDEA_DELETED,
        data: { ideaId },
      },
    });

    return createSuccessResponse(null);
  } catch (error: unknown) {
    console.error('아이디어 삭제 실패:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return createErrorResponse('IDEA_NOT_FOUND', 404);
    }

    return createErrorResponse('IDEA_DELETE_FAILED', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;
  const { ideaId, positionX, positionY, categoryId } = await req.json();

  if (!ideaId) {
    return createErrorResponse('IDEA_ID_REQUIRED', 400);
  }

  try {
    const updatedIdea = await ideaRepository.update(ideaId, {
      positionX,
      positionY,
      categoryId,
    });

    // SSE 브로드캐스팅: 아이디어 이동 이벤트
    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.IDEA_MOVED,
        data: { ideaId, positionX, positionY, categoryId },
      },
    });

    return createSuccessResponse(updatedIdea);
  } catch (error: unknown) {
    console.error('아이디어 수정 실패:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return createErrorResponse('IDEA_NOT_FOUND', 404);
    }

    return createErrorResponse('IDEA_UPDATE_FAILED', 500);
  }
}
