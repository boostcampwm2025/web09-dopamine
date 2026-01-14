type IdeaVoteSnapshot = {
  id: string;
  agreeCount?: number;
  disagreeCount?: number;
};

/**
 * 아이디어의 투표 데이터를 바탕으로 찬성, 반대, 총합, 차이 수치를 계산.
 */
export function getVoteCounts(idea: IdeaVoteSnapshot) {
  const agree = idea.agreeCount ?? 0;
  const disagree = idea.disagreeCount ?? 0;
  const total = agree + disagree;
  const diff = Math.abs(agree - disagree);
  return { agree, disagree, total, diff };
}
