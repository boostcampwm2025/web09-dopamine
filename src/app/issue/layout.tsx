import Sidebar from '@/common/Sidebar/Sidebar';
import SidebarItem from '@/common/Sidebar/SidebarItem';
import * as S from '@/common/Sidebar/styles';

export default function layout() {
  return (
    <>
      <header>header</header>
      <Sidebar>
        <S.SidebarTitle>ISSUE MAP</S.SidebarTitle>
        <S.SidebarTitle>ISSUE LIST</S.SidebarTitle>
        <S.SidebarList>
          <SidebarItem
            title="new issue"
            href="#"
            status="open"
          />
        </S.SidebarList>
      </Sidebar>
    </>
  );
}
