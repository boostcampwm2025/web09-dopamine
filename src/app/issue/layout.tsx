import Sidebar from '@/common/Sidebar/Sidebar';
import SidebarItem from '@/common/Sidebar/SidebarItem';
import * as S from '@/common/Sidebar/styles';

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
        <S.SidebarTitle>ISSUE MAP</S.SidebarTitle>
        <S.SidebarTitle>ISSUE LIST</S.SidebarTitle>
        <S.SidebarList>
          {ISSUE_LIST.map((issue) => (
            <SidebarItem
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
