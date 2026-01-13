import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

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

    return NextResponse.json(idea, { status: 200 });
  } catch (error) {
    console.error('아이디어 상세 조회 실패:', error);
    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
