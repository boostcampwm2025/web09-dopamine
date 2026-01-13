import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { title, nickname } = await req.json();

  if (!nickname || !title) {
    return NextResponse.json({ message: 'nickname과 title은 필수입니다.' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 익명 유저 생성
      const user = await tx.user.create({
        data: {
          displayName: nickname,
          provider: null,
        },
      });

      // 2. 빠른 이슈 생성
      const issue = await tx.issue.create({
        data: {
          title,
        },
      });

      // 3. 이슈 참여자(owner)
      await tx.issueMember.create({
        data: {
          issueId: issue.id,
          userId: user.id,
        },
      });

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
