import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getChoseong } from 'es-hangul';
import MemberSidebarItem from '@/components/sidebar/member-sidebar-item';
import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import { ISSUE_STATUS, MEMBER_ROLE } from '@/constants/issue';
import { getTopicIssues } from '@/lib/api/issue-map';
import { useIssueData, useIssueId, useIssueQuery } from '../../hooks';
import { useIssueStore } from '../../store/use-issue-store';
import IssueGraphLink from './issue-graph-link';
import NewIssueButton from './new-issue-button';

const ISSUE_LIST = [
  { title: 'new issue', href: '#', status: ISSUE_STATUS.BRAINSTORMING },
  { title: 'categorize', href: '#', status: ISSUE_STATUS.CATEGORIZE },
  { title: 'voting issue', href: '#', status: ISSUE_STATUS.VOTE },
  { title: 'selecting issue', href: '#', status: ISSUE_STATUS.SELECT },
  { title: 'closed issue', href: '#', status: ISSUE_STATUS.CLOSE },
] as const;

export default function IssueSidebar() {
  const issueId = useIssueId();
  const pathname = usePathname();
  const params = useParams();

  // 현재 페이지가 토픽 페이지인지 확인
  const isTopicPage = pathname?.startsWith('/topic');
  const topicIdFromUrl = isTopicPage ? (params.id as string) : null;

  const { isQuickIssue, members } = useIssueData(issueId);
  const { onlineMemberIds } = useIssueStore();

  // 이슈 페이지에서 토픽 ID 가져오기
  const { data: issue } = useIssueQuery(issueId);
  const topicIdFromIssue = issue?.topicId;

  // 토픽 ID 결정: 토픽 페이지면 URL에서, 이슈 페이지면 이슈 데이터에서
  const topicId = isTopicPage ? topicIdFromUrl : topicIdFromIssue;

  // 토픽의 이슈 목록 가져오기 (토픽 페이지 또는 정식 이슈인 경우)
  const { data: topicIssues = [] } = useQuery({
    queryKey: ['topics', topicId, 'issues'],
    queryFn: () => getTopicIssues(topicId!),
    enabled: !!topicId,
  });

  const [searchValue, setSearchValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.role !== b.role) {
        return a.role === MEMBER_ROLE.OWNER ? -1 : 1;
      }

      const isAOnline = onlineMemberIds.includes(a.id);
      const isBOnline = onlineMemberIds.includes(b.id);

      if (isAOnline !== isBOnline) {
        return Number(isBOnline) - Number(isAOnline);
      }
      return a.displayName.localeCompare(b.displayName);
    });
    }, [members, onlineMemberIds]);

  const filteredMembers = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return sortedMembers;
    const normalized = trimmed.toLowerCase();
    const searchChoseong = getChoseong(trimmed);
    
    return sortedMembers.filter((member) => {
      const name = member.displayName;

      // 일반 문자열 포함 여부 확인 (한글 완성형 및 영문 대소문자 대응)
      if (name.toLowerCase().includes(normalized)) return true;
      
      // 검색어에서 초성을 추출할 수 없는 경우(특수문자 등)는 다음 단계로 넘어감
      if (!searchChoseong) return false;
      
      // 초성 검색 비교
      return getChoseong(name).includes(searchChoseong);
    });
  }, [searchTerm, sortedMembers]);

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

  // 토픽 페이지에서는 멤버 리스트를 표시하지 않음
  const showMemberList = !isTopicPage;

  // 이슈 목록을 표시할지 결정
  // - 토픽 페이지: 항상 표시
  // - 이슈 페이지: quickIssue가 아닌 경우만 표시 (topicId가 있는 정식 이슈)
  const showIssueList = isTopicPage || !isQuickIssue;

  return (
    <Sidebar
      inputProps={{
        value: searchValue,
        onChange: handleSearchChange,
      }}
    >
      {showIssueList && (
        <>
          {!isTopicPage && <IssueGraphLink />}
          <S.SidebarTitle>
            <span>ISSUE LIST</span>
            <NewIssueButton />
          </S.SidebarTitle>
          <S.SidebarList>
            {topicId
              ? topicIssues.map((issue) => (
                  <SidebarItem
                    key={issue.id}
                    title={issue.title}
                    href={`/issue/${issue.id}`}
                    status={issue.status as any}
                  />
                ))
              : ISSUE_LIST.map((issue) => (
                  <SidebarItem
                    key={issue.title}
                    title={issue.title}
                    href={issue.href}
                    status={issue.status}
                  />
                ))}
          </S.SidebarList>
        </>
      )}

      {showMemberList && (
        <>
          <S.SidebarTitle>
            MEMBER LIST
            <span>
              ({onlineMemberIds.length}/{sortedMembers.length})
            </span>
          </S.SidebarTitle>
          <S.SidebarList>
            {filteredMembers.map((user) => {
              const isOnline = onlineMemberIds.includes(user.id);
              return (
                <MemberSidebarItem
                  key={user.displayName}
                  id={user.id}
                  name={user.displayName}
                  role={user.role}
                  isConnected={isOnline}
                />
              );
            })}
          </S.SidebarList>
        </>
      )}
    </Sidebar>
  );
}
