interface Votable {
  agreeCount: number;
  disagreeCount: number;
}

export const compareIdeasByVote = (a: Votable, b: Votable): number => {
  // 1. 찬반 차이
  const scoreA = a.agreeCount - a.disagreeCount;
  const scoreB = b.agreeCount - b.disagreeCount;

  if (scoreA !== scoreB) {
    return scoreB - scoreA;
  }

  // 2. 총 투표수
  const totalA = a.agreeCount + a.disagreeCount;
  const totalB = b.agreeCount + b.disagreeCount;

  return totalB - totalA;
};

export const assignRank = <T>(
  sortedList: T[],
  compareFn: (a: T, b: T) => number,
): (T & { rank: number })[] => {
  let currentRank = 0;

  return sortedList.map((item, index) => {
    // 0번째가 아니고, 앞 사람과 점수(비교결과)가 같다면 동점자
    const isTie = index > 0 && compareFn(sortedList[index - 1], item) === 0;

    if (!isTie) {
      // 동점이 아니면 현재 순서(index + 1)가 등수가 됨 (1224 방식)
      currentRank = index + 1;
    }

    // 기존 아이템에 rank 속성을 합쳐서 반환
    return { ...item, rank: currentRank };
  });
};
