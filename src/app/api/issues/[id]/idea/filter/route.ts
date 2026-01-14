import { NextRequest, NextResponse } from 'next/server';
import { ideaRepository } from '@/lib/repositories/idea.repository';

// 클라이언트로부터 받을 수 있는 유효한 필터 타입 정의
type IdeaFilterType = 'most-liked' | 'need-discussion' | 'none';

/**
 * 전달받은 값이 유효한 IdeaFilterType인지 확인하는 타입 가드 함수
 */
const isIdeaFilterType = (value: string | null): value is IdeaFilterType => {
  if (!value) return false;
  return value === 'most-liked' || value === 'need-discussion' || value === 'none';
};

/**
 * 특정 이슈 내의 아이디어들을 필터링하여 대상 ID 목록만 반환하는 API
 * 예: GET /api/issues/[id]/ideas/filter?type=most-liked
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params; // 이슈 고유 ID
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('type'); // 쿼리 스트링에서 필터 타입 추출

  // 1. 유효성 검사: 허용되지 않은 필터 타입이 들어오면 400 에러 반환
  if (!isIdeaFilterType(filter)) {
    return NextResponse.json({ message: 'invalid filter type' }, { status: 400 });
  }

  try {
    // 2. 비즈니스 로직 호출: DB 레포지토리에서 실제 필터링/정렬 수행
    // (이전에는 프론트엔드 useFilterIdea 훅 내부에서 처리하던 로직)
    const ids = await ideaRepository.findFilteredIdeaIds(id, filter);

    // 3. 결과 반환: 필터링 조건에 부합하는 아이디어 ID 배열 반환
    return NextResponse.json({ ids });
  } catch (error) {
    // 4. 예외 처리: DB 장애 등 서버 내부 오류 시 500 에러 반환
    console.error('idea filter failed:', error);
    return NextResponse.json({ message: 'failed to filter ideas' }, { status: 500 });
  }
}
