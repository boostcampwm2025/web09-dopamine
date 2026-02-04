import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getChoseong } from 'es-hangul';
import { MEMBER_ROLE } from '@/constants/issue';
import { useTopicId, useTopicIssuesQuery } from '@/hooks';
import { useIssueData, useIssueId, useIssueIdentity } from '../../hooks';
import { matchSearch } from '@/lib/utils/search';
import { useIssueStore } from '../../store/use-issue-store';

export const useIssueSidebar = () => {
  // 클라이언트 마운트 감지
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 토픽 ID 및 페이지 타입 가져오기
  const { topicId, isTopicPage } = useTopicId();
  const pathname = usePathname();
  const isSummaryPage = pathname?.endsWith('/summary');

  const issueId = useIssueId();
  // 토픽 페이지에서는 이슈 데이터 가져오지 않음
  const { isQuickIssue, members } = useIssueData(issueId, !isTopicPage);
  const { onlineMemberIds } = useIssueStore();

  const { userId: currentUserId } = useIssueIdentity(issueId, {
    enabled: !isTopicPage,
    isQuickIssue: isTopicPage ? false : undefined,
  });

  // 토픽의 이슈 목록 가져오기
  const { data: topicIssues = [] } = useTopicIssuesQuery(topicId);

  // 검색 관련 상태
  const [searchValue, setSearchValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTarget, setSearchTarget] = useState<'issue' | 'member' | 'topic'>('issue');

  // 멤버 정렬: 소유자 > 온라인 > 이름순
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      // 1. 역할별 정렬 (소유자 우선)
      if (a.role !== b.role) {
        return a.role === MEMBER_ROLE.OWNER ? -1 : 1;
      }

      // 2. 온라인 상태별 정렬 (요약 페이지에서는 제외)
      if (!isSummaryPage) {
        const isAOnline = onlineMemberIds.includes(a.id);
        const isBOnline = onlineMemberIds.includes(b.id);

        if (isAOnline !== isBOnline) {
          return Number(isBOnline) - Number(isAOnline);
        }
      }

      // 3. 이름순 정렬
      const nameA = a.nickname || '익명';
      const nameB = b.nickname || '익명';
      return nameA.localeCompare(nameB);
    });
  }, [members, onlineMemberIds, isSummaryPage]);

  // 공통 검색 파라미터 계산
  const searchParams = useMemo(() => {
    const trimmed = searchTerm.trim();
    return {
      trimmed,
      normalized: trimmed.toLowerCase(),
      searchChoseong: getChoseong(trimmed),
    };
  }, [searchTerm]);

  // 빠른 이슈에서는 항상 멤버만 검색, 그 외에는 searchTarget 따름
  const effectiveSearchTarget = isQuickIssue ? 'member' : searchTarget;

  // 멤버 검색 필터링
  const filteredMembers = useMemo(() => {
    // 멤버 검색 모드가 아니면 전체 반환
    if (effectiveSearchTarget !== 'member') return sortedMembers;

    const { trimmed, normalized, searchChoseong } = searchParams;
    if (!trimmed) return sortedMembers;

    return sortedMembers.filter((member) =>
      matchSearch(member.nickname || '익명', normalized, searchChoseong),
    );
  }, [searchParams, sortedMembers, effectiveSearchTarget]);

  // 이슈 검색 필터링
  const filteredIssues = useMemo(() => {
    // 이슈 검색 모드가 아니면 전체 반환
    if (effectiveSearchTarget !== 'issue') return topicIssues;

    const { trimmed, normalized, searchChoseong } = searchParams;
    if (!trimmed) return topicIssues;

    return topicIssues.filter((issue) =>
      matchSearch(issue.title || '', normalized, searchChoseong),
    );
  }, [searchParams, topicIssues, effectiveSearchTarget]);

  // 검색어 입력 핸들러
  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  }, []);

  // 검색어 디바운싱 (300ms)
  useEffect(() => {
    const debounceId = window.setTimeout(() => {
      setSearchTerm(searchValue);
    }, 300);

    return () => {
      window.clearTimeout(debounceId);
    };
  }, [searchValue]);

  // 멤버 리스트 표시 여부: 토픽 페이지에서는 숨김
  const showMemberList = !isTopicPage;

  // 이슈 목록 표시 여부
  // - 토픽 페이지: 항상 표시
  // - 이슈 페이지: 정식 이슈인 경우만 표시 (퀵 이슈는 숨김)
  const showIssueList = isTopicPage || !isQuickIssue;

  const router = useRouter();

  const goToIssueMap = useCallback(() => {
    if (topicId) {
      router.push(`/topic/${topicId}`);
    }
  }, [topicId]);

  return {
    // 마운트 상태
    isMounted,

    // 데이터
    topicId,
    issueId,
    isTopicPage,
    topicIssues,
    filteredIssues,
    filteredMembers,
    onlineMemberIds,
    sortedMembers,

    isQuickIssue,

    // 검색
    searchValue,
    handleSearchChange,

    // 표시 여부
    showMemberList,
    showIssueList,
    isSummaryPage,

    // 액션
    goToIssueMap,
    searchTarget,
    setSearchTarget,
    currentUserId,
  };
};
