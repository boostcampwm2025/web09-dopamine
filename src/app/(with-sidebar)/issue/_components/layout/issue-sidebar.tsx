import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import MemberSidebarItem from '@/components/sidebar/member-sidebar-item';
import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import { ISSUE_STATUS, MEMBER_ROLE } from '@/constants/issue';
import { useIssueData, useIssueId } from '../../hooks';
import { useIssueStore } from '../../store/use-issue-store';
import IssueGraphLink from './issue-graph-link';
import NewIssueButton from './new-issue-button';
import { getChoseong } from 'es-hangul';

const ISSUE_LIST = [
  { title: 'new issue', href: '#', status: ISSUE_STATUS.BRAINSTORMING },
  { title: 'categorize', href: '#', status: ISSUE_STATUS.CATEGORIZE },
  { title: 'voting issue', href: '#', status: ISSUE_STATUS.VOTE },
  { title: 'selecting issue', href: '#', status: ISSUE_STATUS.SELECT },
  { title: 'closed issue', href: '#', status: ISSUE_STATUS.CLOSE },
] as const;

export default function IssueSidebar() {
  const issueId = useIssueId();
  const { isQuickIssue, members } = useIssueData(issueId);
  const { onlineMemberIds } = useIssueStore();
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

  return (
    <Sidebar
      inputProps={{
        value: searchValue,
        onChange: handleSearchChange,
      }}
    >
      {!isQuickIssue && (
        <>
          <IssueGraphLink />
          <S.SidebarTitle>
            <span>ISSUE LIST</span>
            <NewIssueButton />
          </S.SidebarTitle>
          <S.SidebarList>
            {ISSUE_LIST.map((issue) => (
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
        })
      }
    </S.SidebarList>
    </Sidebar>
  );
}
