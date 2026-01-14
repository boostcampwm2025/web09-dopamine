import { useEffect, useState } from 'react';
import { fetchFilteredIdeaIds } from '@/lib/api/idea';
import type { IdeaWithPosition } from '../types/idea';

export type FilterType = 'most-liked' | 'need-discussion' | 'none';

export const useFilterIdea = (issueId: string, initialIdeas: IdeaWithPosition[]) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [filteredIds, setFilteredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem(`idea-filter-${issueId}`, activeFilter);
  }, [issueId, activeFilter]);

  useEffect(() => {
    let isActive = true;

    const loadFilteredIds = async () => {
      if (activeFilter === 'none' || initialIdeas.length === 0) {
        setFilteredIds(new Set());
        return;
      }

      const ids = await fetchFilteredIdeaIds(issueId, activeFilter);
      if (!isActive) return;
      setFilteredIds(new Set(ids));
    };

    loadFilteredIds();

    return () => {
      isActive = false;
    };
  }, [issueId, activeFilter, initialIdeas]);

  return {
    activeFilter,
    setFilter: setActiveFilter,
    filteredIds,
  };
};
