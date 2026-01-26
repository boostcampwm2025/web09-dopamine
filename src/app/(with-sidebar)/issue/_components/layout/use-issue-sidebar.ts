import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getChoseong } from 'es-hangul';
import { MEMBER_ROLE } from '@/constants/issue';
import { useTopicId } from '@/hooks/use-topic-id';
import { useIssueData, useIssueId } from '../../hooks';
import { useTopicIssuesQuery } from '@/hooks/issue';
import { useIssueStore } from '../../store/use-issue-store';

export const useIssueSidebar = () => {
  // 클라이언트 마운트 감지
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 토픽 ID 및 페이지 타입 가져오기
  const { topicId, isTopicPage } = useTopicId();

  const issueId = useIssueId();
  // 토픽 페이지에서는 이슈 데이터 가져오지 않음
  const { isQuickIssue, members } = useIssueData(issueId, !isTopicPage);
  const { onlineMemberIds } = useIssueStore();

  // 토픽의 이슈 목록 가져오기
  const { data: topicIssues = [] } = useTopicIssuesQuery(topicId);

  // 검색 관련 상태
  const [searchValue, setSearchValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 멤버 정렬: 소유자 > 온라인 > 이름순
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      // 1. 역할별 정렬 (소유자 우선)
      if (a.role !== b.role) {
        return a.role === MEMBER_ROLE.OWNER ? -1 : 1;
      }

      // 2. 온라인 상태별 정렬
      const isAOnline = onlineMemberIds.includes(a.id);
      const isBOnline = onlineMemberIds.includes(b.id);

      if (isAOnline !== isBOnline) {
        return Number(isBOnline) - Number(isAOnline);
      }

      // 3. 이름순 정렬
      return a.displayName.localeCompare(b.displayName);
    });
  }, [members, onlineMemberIds]);

  // 멤버 검색 필터링: 일반 문자열 검색 + 한글 초성 검색 지원
  const filteredMembers = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return sortedMembers;

    const normalized = trimmed.toLowerCase();
    const searchChoseong = getChoseong(trimmed);

    return sortedMembers.filter((member) => {
      const name = member.displayName;

      // 일반 문자열 포함 여부 확인
      if (name.toLowerCase().includes(normalized)) return true;

      // 초성 검색 비교
      if (!searchChoseong) return false;
      return getChoseong(name).includes(searchChoseong);
    });
  }, [searchTerm, sortedMembers]);

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
    isTopicPage,
    topicIssues,
    filteredMembers,
    onlineMemberIds,
    sortedMembers,

    // 검색
    searchValue,
    handleSearchChange,

    // 표시 여부
    showMemberList,
    showIssueList,

    // 액션
    goToIssueMap,
  };
};
