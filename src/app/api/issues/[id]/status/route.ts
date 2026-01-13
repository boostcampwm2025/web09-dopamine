import { NextRequest, NextResponse } from 'next/server';
import { IssueStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { status } = await req.json();
    const { id } = await params;

    if (!Object.values(IssueStatus).includes(status)) {
      return NextResponse.json({ message: '유효하지 않은 이슈 상태입니다.' }, { status: 400 });
    }

    const issue = await prisma.issue.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!issue) {
      return NextResponse.json({ message: '존재하지 않는 이슈입니다.' }, { status: 404 });
    }

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        status,
        closedAt: status === IssueStatus.CLOSE ? new Date() : null,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error('이슈 상태 변경 실패:', error);
    return NextResponse.json({ message: '이슈 상태 변경에 실패했습니다.' }, { status: 500 });
  }
}
