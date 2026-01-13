import { NextRequest, NextResponse } from 'next/server';
import { IssueRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { addIssueOwner } from '@/lib/repositories/issue-member.repository';
import { createIssue } from '@/lib/repositories/issue.repository';
import { createAnonymousUser } from '@/lib/repositories/user.repository';

export async function POST(req: NextRequest) {
  const { title, nickname } = await req.json();

  if (!nickname || !title) {
    return NextResponse.json({ message: 'nickname과 title은 필수입니다.' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await createAnonymousUser(tx, nickname);
      const issue = await createIssue(tx, title);
      await addIssueOwner(tx, issue.id, user.id, IssueRole.OWNER);

      return {
        issueId: issue.id,
        userId: user.id,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('빠른 이슈 생성 실패:', error);
    return NextResponse.json({ message: '이슈 생성 실패' }, { status: 500 });
  }
}
