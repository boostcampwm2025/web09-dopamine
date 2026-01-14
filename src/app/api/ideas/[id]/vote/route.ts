import { NextRequest, NextResponse } from 'next/server';
import { voteRepository } from '@/lib/repositories/vote.repository';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ideaId = id;
    const { userId, voteType } = await req.json();

    const result = await voteRepository.castVote(ideaId, userId, voteType);

    return NextResponse.json(result);
  } catch (error) {
    console.error('투표 실패:', error);
    return NextResponse.json({ message: '투표 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
