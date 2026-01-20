import { useCallback, useMemo, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import MemberSidebarItem from '@/components/sidebar/member-sidebar-item';
import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import { ISSUE_STATUS, MEMBER_ROLE } from '@/constants/issue';
import { useIssueData, useIssueId } from '../../hooks';
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
  const { isQuickIssue, members } = useIssueData(issueId);
  const [searchValue, setSearchValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.role !== b.role) {
        return a.role === MEMBER_ROLE.OWNER ? -1 : 1;
      }
      return Number(b.isConnected) - Number(a.isConnected);
    });
  }, [members]);

  const filteredMembers = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return sortedMembers;
    const normalized = trimmed.toLowerCase();
    return sortedMembers.filter((member) =>
      member.displayName.toLowerCase().includes(normalized),
    );
  }, [searchTerm, sortedMembers]);

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  }, []);

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      setSearchTerm(searchValue);
    },
    [searchValue],
  );

  return (
    <Sidebar
      inputProps={{
        value: searchValue,
        onChange: handleSearchChange,
        onKeyDown: handleSearchKeyDown,
      }}
    >
      {!isQuickIssue && (
        <>
          <IssueGraphLink />
          <div>
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
          </div>
        </>
      )}

      <div>
        <S.SidebarTitle>MEMBER LIST</S.SidebarTitle>
        <S.SidebarList>
          {filteredMembers.map((user) => (
            <MemberSidebarItem
              key={user.displayName}
              id={user.id}
              name={user.displayName}
              role={user.role}
              isConnected={user.isConnected}
            />
          ))}
        </S.SidebarList>
      </div>
    </Sidebar>
  );
}
