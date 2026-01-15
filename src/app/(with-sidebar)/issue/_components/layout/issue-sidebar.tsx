import { useMemo } from 'react';
import MemberSidebarItem from '@/components/sidebar/member-sidebar-item';
import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import { ISSUE_STATUS, MEMBER_ROLE } from '@/constants/issue';
import { useIssueData } from '../../hooks/use-issue-data';
import { useIssueId } from '../../hooks/use-issue-id';
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

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.role !== b.role) {
        return a.role === MEMBER_ROLE.OWNER ? -1 : 1;
      }
      return Number(b.isConnected) - Number(a.isConnected);
    });
  }, [members]);

  return (
    <Sidebar>
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
          {sortedMembers.map((user) => (
            <MemberSidebarItem
              key={user.displayName}
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
