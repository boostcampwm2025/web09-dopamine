import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import { ISSUE_STATUS } from '@/constants/issue';

const ISSUE_LIST = [
  { title: '더미1', href: '#', status: ISSUE_STATUS.BRAINSTORMING },
  { title: '더미2', href: '#', status: ISSUE_STATUS.BRAINSTORMING },
  { title: '더미3', href: '#', status: ISSUE_STATUS.BRAINSTORMING },
  { title: '더미4', href: '#', status: ISSUE_STATUS.BRAINSTORMING },
  { title: '더미5', href: '#', status: ISSUE_STATUS.BRAINSTORMING },
] as const;

export default function TopicSidebar() {
  return (
    <Sidebar>
      <div>
        <S.SidebarTitle>
          <span>ISSUE LIST</span>
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
    </Sidebar>
  );
}
