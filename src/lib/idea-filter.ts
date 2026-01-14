type IdeaVoteSnapshot = {
  id: string;
  agreeCount?: number;
  disagreeCount?: number;
};

export type FilterType = 'most-liked' | 'need-discussion' | 'none';

/**
 * 아이디어의 투표 현황(찬성, 반대, 총합, 차이)을 계산하는 헬퍼 함수
 */
const getVoteCounts = (idea: IdeaVoteSnapshot) => {
  const agree = idea.agreeCount ?? 0;
  const disagree = idea.disagreeCount ?? 0;
  const total = agree + disagree;
  const diff = Math.abs(agree - disagree); // 찬반 차이의 절대값
  return { agree, disagree, total, diff };
};

/**
 * 활성화된 필터 조건에 따라 하이라이트할 아이디어 ID들을 추출하는 함수
 */
export const getFilteredIdeaIds = (
  ideas: IdeaVoteSnapshot[],
  activeFilter: FilterType,
) => {
  // 필터가 없거나 아이디어가 없으면 계산 없이 즉시 종료
  if (activeFilter === 'none' || ideas.length === 0) return new Set<string>();

  let sorted = [...ideas];

  // 1. 필터 타입에 따른 정렬 및 후보군 필터링
  if (activeFilter === 'most-liked') {
    // [찬성 많은 순] 찬성-반대 격차가 큰 순서대로, 같다면 찬성 표가 많은 순으로 정렬
    sorted.sort((a, b) => {
      const aV = getVoteCounts(a);
      const bV = getVoteCounts(b);
      const aDiff = aV.agree - aV.disagree;
      const bDiff = bV.agree - bV.disagree;
      if (aDiff === bDiff) return bV.agree - aV.agree;
      return bDiff - aDiff;
    });
  } else if (activeFilter === 'need-discussion') {
    // [논의 필요] 찬반 비율 차이가 20% 이내인 후보만 골라 찬성순으로 정렬
    const candidates = ideas.filter((idea) => {
      const { total, diff } = getVoteCounts(idea);
      return total > 0 && diff / total <= 0.2;
    });
    sorted = candidates.sort((a, b) => getVoteCounts(b).agree - getVoteCounts(a).agree);
  }

  // 정렬 후 후보가 없으면 빈 Set 반환
  if (sorted.length === 0) return new Set<string>();

  // 2. 공동 순위 처리를 위한 3위 기준값 추출
  const limit = Math.min(sorted.length, 3);
  const thirdStandard = sorted[limit - 1]; // 기준이 되는 3위 아이디어
  const thirdAgree = getVoteCounts(thirdStandard).agree;

  // 3. 상위 3등 + 기준점과 동일한 성적을 가진 공동 순위 아이디어 포함
  const result = sorted.filter((idea, index) => {
    const ideaV = getVoteCounts(idea);

    // 투표가 없는 아이디어는 제외하여 데이터 신뢰도 유지
    if (ideaV.total === 0) return false;
    
    // 상위 3위까지는 기본 포함
    if (index < 3) return true;

    // "논의 필요" 필터: 3위와 찬성 표수가 같으면 공동 순위로 포함
    if (activeFilter === 'need-discussion') {
      return getVoteCounts(idea).agree === thirdAgree;
    }

    // "찬성 많은 순" 필터: 3위와 찬성 표가 같고, 찬반 격차도 기준치 이상인 경우 포함
    const ideaDiff = ideaV.agree - ideaV.disagree;
    const thirdDiff = thirdStandard
      ? getVoteCounts(thirdStandard).agree - getVoteCounts(thirdStandard).disagree
      : 0;

    return ideaV.agree === thirdAgree && ideaDiff >= thirdDiff;
  });

  // 조회 성능 향상을 위해 ID들을 Set 객체에 담아 반환
  return new Set(result.map((i) => i.id));
};