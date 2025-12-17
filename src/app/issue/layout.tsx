import Sidebar from '@/components/Sidebar/Sidebar';
import SidebarItem from '@/components/Sidebar/SidebarItem';
import * as S from '@/components/Sidebar/styles';
import IssueGraphLink from './IssueGraphLink';

const ISSUE_LIST = [
  { title: 'new issue', href: '#', status: 'open' },
  { title: 'voting issue', href: '#', status: 'voting' },
  { title: 'closed issue', href: '#', status: 'closed' },
] as const;

export default function layout() {
  return (
    <>
      <header>header</header>
      <Sidebar>
        <IssueGraphLink />
        <S.SidebarTitle>ISSUE LIST</S.SidebarTitle>
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
    </>
  );
}
