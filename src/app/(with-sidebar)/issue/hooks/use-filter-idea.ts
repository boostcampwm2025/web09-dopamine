import { useEffect, useMemo, useState } from 'react';
import { voteRepository } from '@/lib/repositories/vote.repository';
import type { IdeaWithPosition } from '../types/idea';

export type FilterType = 'most-liked' | 'need-discussion' | 'none';

export const useFilterIdea = (issueId: string, initialIdeas: IdeaWithPosition[]) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');

  // 필터 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(`idea-filter-${issueId}`, activeFilter);
  }, [issueId, activeFilter]);

  // 하이라이트 아이디 계산 (공동 순위 포함 로직)
  const filteredIds = useMemo(
    () => voteRepository.getFilteredIdeaIds(initialIdeas, activeFilter),
    [initialIdeas, activeFilter],
  );

  return {
    activeFilter,
    setFilter: setActiveFilter,
    filteredIds,
  };
};
