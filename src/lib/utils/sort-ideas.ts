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

  if (totalA !== totalB) {
    return totalB - totalA;
  }

  // 3. 찬성 수
  return b.agreeCount - a.agreeCount;
};
