import Sidebar from '@/components/Sidebar/Sidebar';
import SidebarItem from '@/components/Sidebar/sidebar-item';
import * as S from '@/components/Sidebar/sidebar.styles';
import { ISSUE_STATUS } from '@/constants/issue';
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
