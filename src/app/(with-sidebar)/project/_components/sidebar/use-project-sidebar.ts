import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getChoseong } from 'es-hangul';
import type { FilterType } from '@/components/sidebar/sidebar-filter';
import { useProjectQuery } from '@/hooks/project';
import { matchSearch } from '@/lib/utils/search';

export const useProjectSidebar = () => {
  const params = useParams();
  const projectId = params.id as string;

  const { data: projectData, refetch, isFetching, isLoading } = useProjectQuery(projectId);
  const topics = projectData?.topics || [];
  const members = projectData?.members || [];

  const [searchValue, setSearchValue] = useState('');
  const [searchTarget, setSearchTarget] = useState<FilterType>('topic');

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const filteredTopics = useMemo(() => {
    if (searchTarget !== 'topic') return topics;

    // Pre-calculate search params for efficiency
    const normalizedTerm = searchValue.toLowerCase();
    const searchChoseong = getChoseong(searchValue);

    return topics.filter((topic) => matchSearch(topic.title, normalizedTerm, searchChoseong));
  }, [topics, searchTarget, searchValue]);

  const filteredMembers = useMemo(() => {
    if (searchTarget !== 'member') return members;

    // Pre-calculate search params for efficiency
    const normalizedTerm = searchValue.toLowerCase();
    const searchChoseong = getChoseong(searchValue);

    return members.filter((member) =>
      matchSearch(member.name || '익명', normalizedTerm, searchChoseong),
    );
  }, [members, searchTarget, searchValue]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    filteredTopics,
    filteredMembers,
    searchValue,
    handleSearchChange,
    searchTarget,
    setSearchTarget,
    handleRefresh,
    isRefreshing: isFetching,
    isLoading,
  };
};
