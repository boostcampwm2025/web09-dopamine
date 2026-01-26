import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { authOptions } from '@/lib/auth';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { getUserIdFromRequest } from '@/lib/utils/cookie';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string; ideaId: string }> },
) {
  try {
    const { issueId, ideaId } = await params;

    // 1. 세션에서 userId 확인 (OAuth 로그인 사용자)
    const session = await getServerSession(authOptions);
    let userId: string | null = session?.user?.id ?? null;

    // 2. 세션이 없으면 쿠키에서 확인 (익명 사용자 - 빠른 이슈)
    if (!userId) {
      userId = getUserIdFromRequest(req, issueId) ?? null;
    }

    const idea = await ideaRepository.findById(ideaId);

    if (!idea) {
      return createErrorResponse('IDEA_NOT_FOUND', 404);
    }

    const myVote = userId ? await ideaRepository.findMyVote(ideaId, userId) : null;

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
  { params }: { params: Promise<{ issueId: string; ideaId: string }> },
): Promise<NextResponse> {
  const { issueId, ideaId } = await params;

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
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId } = await params;
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
