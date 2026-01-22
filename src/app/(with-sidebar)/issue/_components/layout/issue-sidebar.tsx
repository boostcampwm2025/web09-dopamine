import MemberSidebarItem from '@/components/sidebar/member-sidebar-item';
import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import { ISSUE_STATUS } from '@/constants/issue';
import IssueGraphLink from './issue-graph-link';
import NewIssueButton from './new-issue-button';
import { useIssueSidebar } from './use-issue-sidebar';

const ISSUE_LIST = [
  { title: 'new issue', href: '#', status: ISSUE_STATUS.BRAINSTORMING },
  { title: 'categorize', href: '#', status: ISSUE_STATUS.CATEGORIZE },
  { title: 'voting issue', href: '#', status: ISSUE_STATUS.VOTE },
  { title: 'selecting issue', href: '#', status: ISSUE_STATUS.SELECT },
  { title: 'closed issue', href: '#', status: ISSUE_STATUS.CLOSE },
] as const;

export default function IssueSidebar() {
  const {
    isMounted,
    topicId,
    isTopicPage,
    topicIssues,
    filteredMembers,
    onlineMemberIds,
    sortedMembers,
    searchValue,
    handleSearchChange,
    showMemberList,
    showIssueList,
  } = useIssueSidebar();

  return (
    <Sidebar
      inputProps={{
        value: searchValue,
        onChange: handleSearchChange,
      }}
    >
      {isMounted && showIssueList && (
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

      {isMounted && showMemberList && (
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
