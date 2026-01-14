import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    //TODO: userId 전달 방식 수정 필요
    const userId = req.headers.get('x-user-id');

    const idea = await prisma.idea.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!idea) {
      return NextResponse.json({ message: '해당 아이디어를 찾을 수 없습니다.' }, { status: 404 });
    }

    const myVote = userId
      ? await prisma.vote.findFirst({ where: { ideaId: id, userId, deletedAt: null } })
      : null;

    return NextResponse.json({ ...idea, myVote: myVote?.type ?? null, status: 200 });
  } catch (error) {
    console.error('아이디어 상세 조회 실패:', error);
    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
