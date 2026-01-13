import { useEffect, useMemo, useState } from 'react';
import { getVoteCounts } from '../services/issue-service';
import type { IdeaWithPosition } from '../types/idea';

export type FilterType = 'most-liked' | 'need-discussion' | 'none';

export const useIdeaHighlight = (issueId: string, initialIdeas: IdeaWithPosition[]) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');

  // 2. 필터 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(`idea-filter-${issueId}`, activeFilter);
  }, [issueId, activeFilter]);

  // 3. 하이라이트 아이디 계산 (공동 순위 포함 로직)
  const highlightedIds = useMemo(() => {
    if (activeFilter === 'none' || initialIdeas.length === 0) return new Set<string>();

    let sorted = [...initialIdeas];

    if (activeFilter === 'most-liked') {
      // 찬성 많은 순 -> 전체 참여 많은 순 정렬
      sorted.sort((a, b) => {
        const aV = getVoteCounts(a);
        const bV = getVoteCounts(b);
        const aDiff = aV.agree - aV.disagree;
        const bDiff = bV.agree - bV.disagree;
        if (aDiff === bDiff) return bV.agree - aV.agree;
        return bDiff - aDiff;
      });
    } else if (activeFilter === 'need-discussion') {
      // 찬반 비율 20% 이내 후보군 필터링 후 찬성순 정렬
      const candidates = initialIdeas.filter((idea) => {
        const { total, diff } = getVoteCounts(idea);
        return total > 0 && diff / total <= 0.2;
      });
      sorted = candidates.sort((a, b) => getVoteCounts(b).agree - getVoteCounts(a).agree);
    }

    if (sorted.length === 0) return new Set<string>();

    // 상위 3등 기준값 추출 (공동 순위 포함)
    const limit = Math.min(sorted.length, 3);
    const thirdStandard = sorted[limit - 1];
    const thirdAgree = getVoteCounts(thirdStandard).agree;

    const result = sorted.filter((idea, index) => {
      if (index < 3) return true;

      const ideaV = getVoteCounts(idea);

      if (ideaV.total === 0) return false;

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
  }, [initialIdeas, activeFilter]);

  return {
    activeFilter,
    setFilter: setActiveFilter,
    highlightedIds,
  };
};
