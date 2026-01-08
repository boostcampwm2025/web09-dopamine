import { useState, useMemo, useEffect } from 'react';
import type { IdeaWithPosition } from '../types/idea';
import { getVoteCounts } from '../services/issue-service';

export type FilterType = 'most-liked' | 'hot-potato' | 'none';

export const useIdeaHighlight = (issueId: string, initialIdeas: IdeaWithPosition[]) => {
  // 1. 필터 상태 관리 (초기값은 localStorage에서 복구)
  const [activeFilter, setActiveFilter] = useState<FilterType>(() => {
    const saved = localStorage.getItem(`idea-filter-${issueId}`);
    return (saved as FilterType) || 'none';
  });

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
        if (bV.agree !== aV.agree) return bV.agree - aV.agree;
        return bV.total - aV.total;
      });
    } else if (activeFilter === 'hot-potato') {
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
      // 3등과 찬성 수가 같다면 무제한 포함
      return getVoteCounts(idea).agree === thirdAgree;
    });

    return new Set(result.map((i) => i.id));
  }, [initialIdeas, activeFilter]);

  return {
    activeFilter,
    setFilter: setActiveFilter,
    highlightedIds,
  };
};
