import { useEffect, useState } from 'react';
import type { IdeaWithPosition } from '../types/idea';

export type FilterType = 'most-liked' | 'need-discussion' | 'none';

export const useFilterIdea = (issueId: string, initialIdeas: IdeaWithPosition[]) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [filteredIds, setFilteredIds] = useState<Set<string>>(new Set());

  // 필터 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(`idea-filter-${issueId}`, activeFilter);
  }, [issueId, activeFilter]);

  useEffect(() => {
    // 경쟁상태 방지를 위한 플래그
    let cancelled = false;

    const loadFilteredIds = async () => {
      // 1. 필터가 'none'인 경우 API 호출 없이 상태를 즉시 초기화
      if (activeFilter === 'none') {
        setFilteredIds(new Set());
        return;
      }

      try {
        // 2. 서버에 선택된 필터 기준에 따른 아이디어 ID 목록을 요청
        const response = await fetch(`/api/issues/${issueId}/idea?filter=${activeFilter}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch filtered ids');
        }
        
        const data = await response.json();

        // 3. [검증] 최신 요청에 대한 응답인 경우에만 상태 업데이트
        // (네트워크 지연으로 인해 이전 필터 결과가 나중에 도착하는 현상 방지)
        if (!cancelled) {
          setFilteredIds(new Set(data.filteredIds ?? []));
        }
      } catch (error) {
        // 4. 요청 실패 시 에러 로그를 남기고 필터링된 목록을 비움
        console.error('필터링 요청 실패:', error);
        if (!cancelled) {
          setFilteredIds(new Set());
        }
      }
    };

    loadFilteredIds();

    return () => {
      cancelled = true;
    };
  }, [issueId, activeFilter, initialIdeas]);

  return {
    activeFilter,
    setFilter: setActiveFilter,
    filteredIds,
  };
};
