import { NextRequest, NextResponse } from 'next/server';
import { issueMemberService } from '@/lib/services/issue-member.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { broadcast } from '@/lib/sse/sse-service';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string; userId: string }> },
): Promise<NextResponse> {
  const { issueId, userId } = await params;

  try {
    const member = await issueMemberService.checkNicknameExists(issueId, userId);

    if (!member) {
      return createErrorResponse('MEMBER_NOT_FOUND', 404);
    }

    return createSuccessResponse({
      id: member.userId,
      nickname: member.nickname,
      role: member.role,
    });
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    return createErrorResponse('MEMBER_FETCH_FAILED', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string; userId: string }> },
): Promise<NextResponse> {
  const { issueId, userId } = await params;

  try {
    const body = await req.json();
    const { nickname } = body;

    if (!nickname) {
      return createErrorResponse('NICKNAME_REQUIRED', 400);
    }

    // 닉네임 업데이트
    await issueMemberService.updateNickname(issueId, userId, nickname);

    // SSE 브로드캐스트
    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.MEMBER_UPDATED,
        data: { userId, nickname },
      },
    });

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('닉네임 수정 실패:', error);
    return createErrorResponse('NICKNAME_UPDATE_FAILED', 500);
  }
}
