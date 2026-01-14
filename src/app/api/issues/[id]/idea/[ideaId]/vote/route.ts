import { NextRequest, NextResponse } from 'next/server';
import { VoteType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { voteRepository } from '@/lib/repositories/vote.repository';

/**
 * 클라이언트의 문자열 타입(agree/disagree)을 DB용 Enum 타입으로 변환
 */
const toVoteType = (type: string | null) => {
  if (!type) return null;
  if (type === 'agree') return VoteType.AGREE;
  if (type === 'disagree') return VoteType.DISAGREE;
  return null;
};

/**
 * DB용 Enum 타입을 클라이언트용 문자열 타입으로 변환
 */
const toClientVoteType = (type: VoteType | null) => {
  if (type === VoteType.AGREE) return 'agree';
  if (type === VoteType.DISAGREE) return 'disagree';
  return null;
};

/**
 * 아이디어 투표를 생성하거나 업데이트하는 핸들러
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ideaId: string }> },
): Promise<NextResponse> {
  const { ideaId } = await params;
  const { userId, type } = await req.json();

  // 1. 필수 파라미터 유효성 검사
  if (!userId) {
    return NextResponse.json({ message: 'userId is required.' }, { status: 400 });
  }

  // 2. 투표 타입 유효성 검사 (agree, disagree가 아닌 경우 처리)
  const normalizedType = toVoteType(type);
  if (type && !normalizedType) {
    return NextResponse.json({ message: 'Invalid vote type.' }, { status: 400 });
  }

  try {
    // 3. 트랜잭션 시작: 투표 기록과 합계 계산이 하나의 단위로 실행됨
    const result = await prisma.$transaction(async (tx) => {
      // 3-1. 투표 데이터 저장
      const userVote = await voteRepository.setVote(ideaId, userId, normalizedType, tx);
      
      // 3-2. 해당 아이디어의 최신 찬성/반대 수 계산
      const { agreeCount, disagreeCount } = await voteRepository.countByIdeaId(ideaId, tx);
      
      return { userVote, agreeCount, disagreeCount };
    });

    // 4. 성공 응답: 최신 투표 수와 사용자의 현재 투표 상태 반환
    return NextResponse.json({
      agreeCount: result.agreeCount,
      disagreeCount: result.disagreeCount,
      userVote: toClientVoteType(result.userVote),
    });
  } catch (error) {
    // 5. 에러 처리: DB 연결 실패나 로직 오류 시 500 에러 반환
    console.error('Vote update failed:', error);
    return NextResponse.json({ message: 'Vote update failed.' }, { status: 500 });
  }
}