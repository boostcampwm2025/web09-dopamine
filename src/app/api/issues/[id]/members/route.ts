import { NextRequest, NextResponse } from 'next/server';
import { IssueRole } from '@prisma/client';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { prisma } from '@/lib/prisma';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { createAnonymousUser } from '@/lib/repositories/user.repository';
import { issueMemberService } from '@/lib/services/issue-member.service';
import { broadcast } from '@/lib/sse/sse-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get('nickname');

  if (nickname) {
    const isDuplicate = await issueMemberService.checkNicknameDuplicate(id, nickname);
    return NextResponse.json({ isDuplicate });
  }

  try {
    const members = await issueMemberRepository.findMembersByIssueId(id);

    if (!members) {
      return NextResponse.json({ message: '참여자가 존재하지 않습니다.' }, { status: 404 });
    }

    const response = members.map((member) => ({
      id: member.user.id,
      displayName: member.user.displayName,
      role: member.role,
      isConnected: true, // 지금은 기본값, 나중에 SSE 붙이면 여기서 합치면 됨
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('이슈 조회 실패:', error);
    return NextResponse.json({ message: '이슈 조회에 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;
  const { nickname } = await req.json();

  if (!nickname) {
    return NextResponse.json({ message: 'nickname은 필수입니다.' }, { status: 400 });
  }

  try {
    const issue = await findIssueById(issueId);

    if (!issue) {
      return NextResponse.json({ message: '존재하지 않는 이슈입니다.' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await createAnonymousUser(tx, nickname);
      await issueMemberRepository.addIssueOwner(tx, issueId, user.id, IssueRole.MEMBER);

      return {
        userId: user.id,
      };
    });

    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.MEMBER_JOINED,
        data: {},
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('이슈 참여 실패:', error);
    return NextResponse.json({ message: '이슈 참여에 실패했습니다.' }, { status: 500 });
  }
}
