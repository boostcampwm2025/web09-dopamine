import { NextRequest } from 'next/server';
import { IssueRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { createIssue } from '@/lib/repositories/issue.repository';
import { createAnonymousUser } from '@/lib/repositories/user.repository';
import { createErrorResponse } from '@/lib/utils/api-helpers';
import { createSuccessResponse } from '@/lib/utils/api-helpers';
import { setUserIdCookie } from '@/lib/utils/cookie';

export async function POST(req: NextRequest) {
  const { title, nickname } = await req.json();

  if (!nickname || !title) {
    return createErrorResponse('NICKNAME_AND_TITLE_REQUIRED', 400);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await createAnonymousUser(tx, nickname);
      const issue = await createIssue(tx, title);
      await issueMemberRepository.addIssueMember(tx, {
        issueId: issue.id,
        userId: user.id,
        nickname: nickname,
        role: IssueRole.OWNER,
      });

      return {
        issueId: issue.id,
        userId: user.id,
      };
    });

    // 빠른 이슈일 때만 익명 쿠키 생성
    if (nickname) {
      await setUserIdCookie(result.issueId, result.userId);
    }

    return createSuccessResponse(result, 201);
  } catch (error) {
    console.error('빠른 이슈 생성 실패:', error);
    return createErrorResponse('ISSUE_CREATE_FAILED', 500);
  }
}
