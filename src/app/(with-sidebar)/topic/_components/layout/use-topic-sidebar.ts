import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getChoseong } from 'es-hangul';
import { useTopicId, useTopicIssuesQuery } from '@/hooks';
import { matchSearch } from '@/lib/utils/search';

export const useTopicSidebar = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { topicId } = useTopicId();
  const { data: topicIssues = [] } = useTopicIssuesQuery(topicId);

  const [searchValue, setSearchValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const searchParams = useMemo(() => {
    const trimmed = searchTerm.trim();
    return {
      trimmed,
      normalized: trimmed.toLowerCase(),
      searchChoseong: getChoseong(trimmed),
    };
  }, [searchTerm]);

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  }, []);
  useEffect(() => {
    const debounceId = window.setTimeout(() => {
      setSearchTerm(searchValue);
    }, 300);

    return () => {
      window.clearTimeout(debounceId);
    };
  }, [searchValue]);

  const filteredIssues = useMemo(() => {
    const { trimmed, normalized, searchChoseong } = searchParams;
    if (!trimmed) return topicIssues;

    return topicIssues.filter((issue) => matchSearch(issue.title || '', normalized, searchChoseong));
  }, [searchParams, topicIssues]);

  const router = useRouter();

  const handleIssueClick = useCallback((issueId: string) => {
    router.push(`/issue/${issueId}`);
  }, [router]);

  return {
    isMounted,
    topicId,
    filteredIssues,
    searchValue,
    handleSearchChange,
    handleIssueClick,
  };
};
