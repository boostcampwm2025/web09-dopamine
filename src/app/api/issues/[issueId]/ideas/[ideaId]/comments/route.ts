import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { commentRepository } from '@/lib/repositories/comment.repository';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

/**
 * [GET] 특정 아이디어 댓글 목록 조회 API
 * 경로: /api/issues/[id]/ideas/[ideaId]/comment
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ issueId: string; ideaId: string }> },
): Promise<NextResponse> {
  const { issueId, ideaId } = await params;

  try {
    const comments = await commentRepository.findByIdeaId(ideaId, issueId);
    return createSuccessResponse(comments);
  } catch (error) {
    console.error('댓글 조회 중 오류 발생:', error);
    return createErrorResponse('COMMENT_FETCH_FAILED', 500);
  }
}

/**
 * [POST] 새로운 댓글 생성 API
 * 경로: /api/issues/[id]/ideas/[ideaId]/comment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string; ideaId: string }> },
): Promise<NextResponse> {
  const { issueId, ideaId } = await params;
  const { userId, content } = await req.json();

  if (!userId || !content) {
    return createErrorResponse('CONTENT_REQUIRED', 400);
  }

  try {
    const comment = await commentRepository.create({
      ideaId,
      userId,
      content,
      issueId,
    });

    // 최신 댓글 수 계산
    const ideas = await ideaRepository.findByIssueId(issueId);
    const targetIdea = ideas.find((idea) => idea.id === ideaId);
    const commentCount = targetIdea?.commentCount ?? null;

    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.COMMENT_CREATED,
        data: {
          ideaId,
          commentCount,
        },
      },
    });

    return createSuccessResponse(comment, 201);
  } catch (error) {
    console.error('댓글 생성 중 오류 발생:', error);
    return createErrorResponse('COMMENT_CREATE_FAILED', 500);
  }
}
