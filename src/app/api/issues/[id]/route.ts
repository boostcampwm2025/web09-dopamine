import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const issue = await prisma.issue.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
      },
    });

    if (!issue) {
      return NextResponse.json({ message: '존재하지 않는 이슈입니다.' }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error('이슈 조회 실패:', error);
    return NextResponse.json({ message: '이슈 조회에 실패했습니다.' }, { status: 500 });
  }
}
