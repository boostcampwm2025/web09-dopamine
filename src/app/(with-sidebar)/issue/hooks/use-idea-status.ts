import { useCallback } from 'react';
import { CardStatus } from '../types/idea';
import { FilterType } from './use-filter-idea';

export const useIdeaStatus = (filteredIds: Set<string>, activeFilter: FilterType) => {
  return useCallback(
    (ideaId: string): CardStatus => {
      if (!filteredIds.has(ideaId)) return 'default';
      if (activeFilter === 'most-liked') return 'mostLiked';
      if (activeFilter === 'need-discussion') return 'needDiscussion';
      return 'default';
    },
    [filteredIds, activeFilter],
  );
};
