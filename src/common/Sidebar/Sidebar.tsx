import SidebarItem from './SidebarItem';
import * as S from './styles';

export default function Sidebar() {
  return (
    <S.Sidebar>
      <S.SidebarTitle>ISSUE MAP</S.SidebarTitle>
      <S.SidebarTitle>ISSUE LIST</S.SidebarTitle>
      <S.SidebarList>
        <SidebarItem />
      </S.SidebarList>
    </S.Sidebar>
  );
}
