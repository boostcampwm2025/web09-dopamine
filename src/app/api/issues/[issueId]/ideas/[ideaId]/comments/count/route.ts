import { NextRequest, NextResponse } from 'next/server';
import { commentRepository } from '@/lib/repositories/comment.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

/**
 * [GET] 특정 아이디어 댓글 개수 조회 API
 * 경로: /api/issues/[issueId]/ideas/[ideaId]/comments/count
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ issueId: string; ideaId: string }> },
): Promise<NextResponse> {
  const { ideaId } = await params;

  try {
    const count = await commentRepository.countByIdeaId(ideaId);
    return createSuccessResponse({ count });
  } catch (error) {
    console.error('댓글 개수 조회 중 오류 발생:', error);
    return createErrorResponse('COMMENT_COUNT_FETCH_FAILED', 500);
  }
}
