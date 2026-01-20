import { NextRequest, NextResponse } from 'next/server';
import { commentRepository } from '@/lib/repositories/comment.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

/**
 * [PATCH] 기존 댓글 내용 수정 API
 * 경로: /api/issues/[id]/ideas/[ideaId]/comment/[commentId]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ideaId: string; commentId: string }> },
): Promise<NextResponse> {
  const { commentId } = await params;
  const { content } = await req.json();

  if (!content) {
    return createErrorResponse('CONTENT_REQUIRED', 400);
  }

  try {
    const comment = await commentRepository.update(commentId, content);
    return createSuccessResponse(comment);
  } catch (error: any) {
    console.error('댓글 수정 중 오류 발생:', error);

    if (error.code === 'P2025') {
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
  { params }: { params: Promise<{ id: string; ideaId: string; commentId: string }> },
): Promise<NextResponse> {
  const { commentId } = await params;

  try {
    await commentRepository.softDelete(commentId);
    return createSuccessResponse(null, 204);
  } catch (error: any) {
    console.error('댓글 삭제 중 오류 발생:', error);

    if (error.code === 'P2025') {
      return createErrorResponse('COMMENT_NOT_FOUND', 404);
    }

    return createErrorResponse('COMMENT_DELETE_FAILED', 500);
  }
}
