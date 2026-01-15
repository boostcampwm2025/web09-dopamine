import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { prisma } from '@/lib/prisma';
import { broadcast } from '@/lib/services/sse-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: issueId } = await params;
    const { selectedIdeaId } = await req.json();

    if (!selectedIdeaId) {
      return NextResponse.json({ message: '부적절한 요청입니다.' }, { status: 400 });
    }

    const idea = await prisma.idea.findFirst({
      where: {
        id: selectedIdeaId,
        issueId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!idea) {
      return NextResponse.json({ message: '아이디어를 찾을 수 없습니다.' }, { status: 404 });
    }

    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.IDEA_SELECTED,
        data: { ideaId: selectedIdeaId },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('선택된 아이디어를 브로드캐스팅 중 오류가 발생했습니다: ', error);
    return NextResponse.json(
      { message: '선택된 아이디어를 브로드캐스팅할 수 없습니다.' },
      { status: 500 },
    );
  }
}
