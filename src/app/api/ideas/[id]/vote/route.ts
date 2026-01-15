import { NextRequest, NextResponse } from 'next/server';
import { voteService } from '@/lib/services/vote.service';

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ideaId } = await params;
    const { userId, voteType } = await req.json();

    if (!userId || !voteType) {
      return NextResponse.json(
        { message: '잘못된 요청입니다.' }, 
        { status: 400 }
      );
    }

    const result = await voteService.castVote(ideaId, userId, voteType);

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('투표 실패:', error);
    return NextResponse.json(
      { message: '투표 처리 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}
