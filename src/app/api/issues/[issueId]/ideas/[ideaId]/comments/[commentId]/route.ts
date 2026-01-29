import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { commentRepository } from '@/lib/repositories/comment.repository';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

/**
 * [PATCH] 기존 댓글 내용 수정 API
 * 경로: /api/issues/[id]/ideas/[ideaId]/comment/[commentId]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string; ideaId: string; commentId: string }> },
): Promise<NextResponse> {
  const { issueId, ideaId, commentId } = await params;
  const { content } = await req.json();

  if (!content) {
    return createErrorResponse('CONTENT_REQUIRED', 400);
  }

  try {
    const comment = await commentRepository.update(commentId, content);

    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.COMMENT_UPDATED,
        data: {
          ideaId,
          commentId,
        },
      },
    });

    return createSuccessResponse(comment);
  } catch (error: unknown) {
    console.error('댓글 수정 중 오류 발생:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return createErrorResponse('COMMENT_NOT_FOUND', 404);
    }

    return createErrorResponse('COMMENT_UPDATE_FAILED', 500);
  }
}

/**
 * [DELETE] 댓글 삭제(Soft Delete) API
 * 경로: /api/issues/[id]/ideas/[ideaId]/comment/[commentId]
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ issueId: string; ideaId: string; commentId: string }> },
): Promise<NextResponse> {
  const { issueId, ideaId, commentId } = await params;

  try {
    await commentRepository.softDelete(commentId);

    // 최신 댓글 수 계산
    const ideas = await ideaRepository.findByIssueId(issueId);
    const targetIdea = ideas.find((idea) => idea.id === ideaId);
    const commentCount = targetIdea?.commentCount ?? null;

    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.COMMENT_DELETED,
        data: {
          ideaId,
          commentId,
          commentCount,
        },
      },
    });

    return createSuccessResponse(null, 200);
  } catch (error: unknown) {
    console.error('댓글 삭제 중 오류 발생:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return createErrorResponse('COMMENT_NOT_FOUND', 404);
    }

    return createErrorResponse('COMMENT_DELETE_FAILED', 500);
  }
}
