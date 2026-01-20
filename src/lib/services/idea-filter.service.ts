import { FilterType } from '@/app/(with-sidebar)/issue/hooks';

type IdeaVoteSnapshot = {
  id: string;
  agreeCount?: number;
  disagreeCount?: number;
};

const getVoteCounts = (idea: IdeaVoteSnapshot) => {
  const agree = idea.agreeCount ?? 0;
  const disagree = idea.disagreeCount ?? 0;
  const total = agree + disagree;
  const diff = Math.abs(agree - disagree);
  return { agree, disagree, total, diff };
};

export const ideaFilterService = {
  getFilteredIdeaIds(ideas: IdeaVoteSnapshot[], activeFilter: FilterType) {
    if (activeFilter === 'none' || ideas.length === 0) return new Set<string>();

    let sorted = [...ideas];

    if (activeFilter === 'most-liked') {
      sorted.sort((a, b) => {
        const aV = getVoteCounts(a);
        const bV = getVoteCounts(b);
        const aDiff = aV.agree - aV.disagree;
        const bDiff = bV.agree - bV.disagree;
        if (aDiff === bDiff) return bV.agree - aV.agree;
        return bDiff - aDiff;
      });
    } else if (activeFilter === 'need-discussion') {
      const candidates = ideas.filter((idea) => {
        const { total, diff } = getVoteCounts(idea);
        return total > 0 && diff / total <= 0.2;
      });
      sorted = candidates.sort((a, b) => getVoteCounts(b).agree - getVoteCounts(a).agree);
    }

    if (sorted.length === 0) return new Set<string>();

    const limit = Math.min(sorted.length, 3);
    const thirdStandard = sorted[limit - 1];
    const thirdAgree = getVoteCounts(thirdStandard).agree;

    const result = sorted.filter((idea, index) => {
      const ideaV = getVoteCounts(idea);
      if (ideaV.total === 0) return false;
      if (index < 3) return true;

      if (activeFilter === 'need-discussion') {
        return getVoteCounts(idea).agree === thirdAgree;
      }

      const ideaDiff = ideaV.agree - ideaV.disagree;
      const thirdDiff = thirdStandard
        ? getVoteCounts(thirdStandard).agree - getVoteCounts(thirdStandard).disagree
        : 0;

      return ideaV.agree === thirdAgree && ideaDiff >= thirdDiff;
    });

    return new Set(result.map((i) => i.id));
  },
};
