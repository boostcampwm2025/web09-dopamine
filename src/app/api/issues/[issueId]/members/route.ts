import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { IssueRole, Prisma } from '@prisma/client';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { createAnonymousUser } from '@/lib/repositories/user.repository';
import { issueMemberService } from '@/lib/services/issue-member.service';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { setUserIdCookie } from '@/lib/utils/cookie';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId: id } = await params;
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get('nickname');

  if (nickname) {
    const isDuplicate = await issueMemberService.checkNicknameDuplicate(id, nickname);
    return createSuccessResponse({ isDuplicate });
  }

  try {
    const members = await issueMemberRepository.findMembersByIssueId(id);

    if (!members) {
      return createErrorResponse('MEMBERS_NOT_FOUND', 404);
    }

    const response = members.map((member) => ({
      id: member.userId,
      displayName: member.user?.displayName ?? null,
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

    let result: { userId: string };

    const isQuickIssue = !issue.topicId;

    // 토픽 이슈인 경우에만 로그인 사용자로 참여
    if (!isQuickIssue && session?.user?.id) {
      // 이미 참여했는지 확인
      const existingMember = await issueMemberRepository.findMemberByUserId(
        issueId,
        session.user.id,
      );

      if (existingMember) {
        return createSuccessResponse({ userId: session.user.id }, 200);
      }

      // 로그인 사용자를 IssueMember에 추가
      await prisma.$transaction(async (tx) => {
        await issueMemberRepository.addIssueMember(tx, {
          issueId,
          userId: session.user.id,
          nickname: session.user.name || '익명',
          role: IssueRole.MEMBER,
        });
      });

      result = { userId: session.user.id };
    } else {
      // 빠른 이슈 또는 익명 사용자인 경우
      if (!nickname) {
        return createErrorResponse('NICKNAME_REQUIRED', 400);
      }

      result = await prisma.$transaction(async (tx) => {
        const user = await createAnonymousUser(tx, nickname);
        await issueMemberRepository.addIssueMember(tx, {
          issueId,
          userId: user.id,
          nickname,
          role: IssueRole.MEMBER,
        });

        return {
          userId: user.id,
        };
      });

      await setUserIdCookie(issueId, result.userId);
    }

    broadcast({
      issueId,
      excludeConnectionId: actorConnectionId,
      event: {
        type: SSE_EVENT_TYPES.MEMBER_JOINED,
        data: {},
      },
    });

    return createSuccessResponse(result, 201);
  } catch (error: unknown) {
    console.error('이슈 참여 실패:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return createErrorResponse('NICKNAME_DUPLICATE', 409);
      }
    }
    return createErrorResponse('MEMBER_JOIN_FAILED', 500);
  }
}
