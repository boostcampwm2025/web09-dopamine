'use client';

import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import NewIssueButton from '@/app/(with-sidebar)/issue/_components/layout/new-issue-button';
import { useTopicSidebar } from './use-topic-sidebar';

export default function TopicSidebar() {
  const {
    isMounted,
    topicId,
    filteredIssues,
    searchValue,
    handleSearchChange,
  } = useTopicSidebar();

  return (
    <Sidebar
      inputProps={{
        value: searchValue,
        onChange: handleSearchChange,
      }}
    >
      {isMounted && (
        <>
          <S.SidebarTitle>
            <span>ISSUE LIST</span>
            <NewIssueButton />
          </S.SidebarTitle>
          <S.SidebarList>
            {topicId && filteredIssues.map((issue) => (
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
    </Sidebar>
  );
}
