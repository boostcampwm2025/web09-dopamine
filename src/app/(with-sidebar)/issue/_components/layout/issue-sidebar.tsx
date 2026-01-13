import MemberSidebarItem from '@/components/sidebar/member-sidebar-item';
import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import { ISSUE_STATUS, MEMBER_ROLE } from '@/constants/issue';
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

const USER_LIST = [
  { name: '배고픈 용가리', role: MEMBER_ROLE.OWNER },
  { name: '생각하는 무지', role: MEMBER_ROLE.MEMBER },
  { name: '낮잠자는 코끼리', role: MEMBER_ROLE.MEMBER },
  { name: '간식먹는 도마뱀', role: MEMBER_ROLE.MEMBER },
] as const;

export default function IssueSidebar() {
  const { isQuickIssue } = useIssueStore();

  return (
    <Sidebar>
      {isQuickIssue && <IssueGraphLink />}
      <div>
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
      </div>
      <div>
        <S.SidebarTitle>MEMBER LIST</S.SidebarTitle>
        <S.SidebarList>
          {USER_LIST.map((user) => (
            <MemberSidebarItem
              key={user.name}
              name={user.name}
              role={user.role}
            />
          ))}
        </S.SidebarList>
      </div>
    </Sidebar>
  );
}
