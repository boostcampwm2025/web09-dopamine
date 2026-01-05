import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import IssueGraphLink from './issue-graph-link';
import NewIssueButton from './new-issue-button';

const ISSUE_LIST = [
  { title: 'new issue', href: '#', status: 'open' },
  { title: 'voting issue', href: '#', status: 'voting' },
  { title: 'closed issue', href: '#', status: 'closed' },
] as const;

export default function IssueSidebar() {
  return (
    <Sidebar>
      <IssueGraphLink />
      <S.SidebarTitle>
        ISSUE LIST
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
    </Sidebar>
  );
}
