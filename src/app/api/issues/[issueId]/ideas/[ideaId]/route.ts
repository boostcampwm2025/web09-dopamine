import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { getAuthenticatedUserId } from '@/lib/utils/auth-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string; ideaId: string }> },
) {
  try {
    const { issueId, ideaId } = await params;

    const userId = await getAuthenticatedUserId(req, issueId);

    const idea = await ideaRepository.findById(ideaId);

    if (!idea) {
      return createErrorResponse('IDEA_NOT_FOUND', 404);
    }

    // IssueMember 정보 가져오기
    const issueMember = await issueMemberRepository.findMemberByUserId(issueId, idea.userId);

    const myVote = userId ? await ideaRepository.findMyVote(ideaId, userId) : null;

    return createSuccessResponse({
      ...idea,
      commentCount: idea._count?.comments ?? 0,
      myVote: myVote?.type ?? null,
      issueMember: issueMember ? { nickname: issueMember.nickname } : null,
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
  const actorConnectionId = req.headers.get('x-sse-connection-id') || undefined;

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
      excludeConnectionId: actorConnectionId,
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
  const actorConnectionId = req.headers.get('x-sse-connection-id') || undefined;

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
      excludeConnectionId: actorConnectionId,
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
