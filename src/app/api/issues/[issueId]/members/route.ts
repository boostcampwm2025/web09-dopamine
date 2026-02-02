import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { authOptions } from '@/lib/auth';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { setUserIdCookie } from '@/lib/utils/cookie';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId: id } = await params;

  try {
    const members = await issueMemberRepository.findMembersByIssueId(id);

    if (!members) {
      return createErrorResponse('MEMBERS_NOT_FOUND', 404);
    }

    const response = members.map((member) => ({
      id: member.userId,
      nickname: member.nickname,
      role: member.role,
      isConnected: true, // 지금은 기본값, 나중에 SSE 붙이면 여기서 합치면 됨
    }));

    return createSuccessResponse(response);
  } catch (error) {
    console.error('이슈 조회 실패:', error);
    return createErrorResponse('MEMBERS_FETCH_FAILED', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId } = await params;
  const session = await getServerSession(authOptions);
  const { nickname } = await req.json();
  const actorConnectionId = req.headers.get('x-sse-connection-id') || undefined;

  try {
    const issue = await findIssueById(issueId);

    if (!issue) {
      return createErrorResponse('ISSUE_NOT_FOUND', 404);
    }

    let result: { userId: string; didJoin: boolean };

    const isQuickIssue = !issue.topicId;

    // 토픽 이슈인 경우에만 로그인 사용자로 참여
    if (!isQuickIssue && session?.user?.id) {
      const baseName = session.user.displayName ?? session.user.name ?? '익명';
      result = await issueMemberRepository.joinLoggedInMember(issueId, session.user.id, baseName);
    } else {
      // 빠른 이슈 또는 익명 사용자인 경우
      if (!nickname) {
        return createErrorResponse('NICKNAME_REQUIRED', 400);
      }

      result = await issueMemberRepository.joinAnonymousMember(issueId, nickname);

      await setUserIdCookie(issueId, result.userId);
    }

    if (result.didJoin) {
      broadcast({
        issueId,
        excludeConnectionId: actorConnectionId,
        event: {
          type: SSE_EVENT_TYPES.MEMBER_JOINED,
          data: {},
        },
      });
    }

    return createSuccessResponse({ userId: result.userId }, 201);
  } catch (error: unknown) {
    console.error('이슈 참여 실패:', error);
    return createErrorResponse('MEMBER_JOIN_FAILED', 500);
  }
}
