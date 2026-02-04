import MemberSidebarItem from '@/components/sidebar/member-sidebar-item';
import Sidebar from '@/components/sidebar/sidebar';
import SidebarFilter from '@/components/sidebar/sidebar-filter';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import IssueGraphLink from './issue-graph-link';
import NewIssueButton from './new-issue-button';
import { useIssueSidebar } from './use-issue-sidebar';

export default function IssueSidebar() {
  const {
    isMounted,
    isTopicPage,
    filteredIssues,
    filteredMembers,
    onlineMemberIds,
    sortedMembers,
    searchValue,
    handleSearchChange,
    showMemberList,
    showIssueList,
    isSummaryPage,
    goToIssueMap,
    searchTarget,
    isQuickIssue,
    setSearchTarget,
  } = useIssueSidebar();

  return (
    <Sidebar
      inputProps={{
        value: searchValue,
        onChange: handleSearchChange,
      }}
      suffix={
        !isQuickIssue ? (
          <SidebarFilter
            value={searchTarget}
            onChange={setSearchTarget}
          />
        ) : null
      }
    >
      {isMounted && showIssueList && (
        <>
          {!isTopicPage && <IssueGraphLink onClick={goToIssueMap} />}
          <S.SidebarTitle>
            <span>ISSUE LIST</span>
            <NewIssueButton />
          </S.SidebarTitle>
          <S.SidebarList>
            {filteredIssues.map((issue) => (
              <SidebarItem
                key={issue.id}
                title={issue.title}
                href={`/issue/${issue.id}`}
                status={issue.status as any}
              />
            ))}
          </S.SidebarList>
        </>
      )}

      {isMounted && showMemberList && (
        <>
          <S.SidebarTitle>
            MEMBER LIST
            {!isSummaryPage && (
              <span>
                ({onlineMemberIds.length}/{sortedMembers.length})
              </span>
            )}
          </S.SidebarTitle>
          <S.SidebarList>
            {filteredMembers.map((user) => {
              const isOnline = isSummaryPage ? undefined : onlineMemberIds.includes(user.id);
              return (
                <MemberSidebarItem
                  key={user.id}
                  id={user.id}
                  name={user.nickname}
                  role={user.role}
                  profile={user.profile || undefined}
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
