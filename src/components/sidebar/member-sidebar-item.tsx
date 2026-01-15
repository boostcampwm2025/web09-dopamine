import Image from 'next/image';
import { MEMBER_ROLE } from '@/constants/issue';
import * as MemberS from './member-sidebar-item.styles';
import * as S from './sidebar.styles';

interface MemberSidebarItemProps {
  name: string;
  role: typeof MEMBER_ROLE.OWNER | typeof MEMBER_ROLE.MEMBER;
  isConnected: boolean;
}

export default function MemberSidebarItem({ name, role, isConnected }: MemberSidebarItemProps) {
  return (
    <S.SidebarListItem>
      <MemberS.MemberItemButton>
        <MemberS.NameContainer isConnected={isConnected}>
          {role === MEMBER_ROLE.OWNER && (
            <Image
              src="/yellow-crown.svg"
              alt="owner"
              width={18}
              height={18}
            />
          )}
          <span>{name}</span>
        </MemberS.NameContainer>
        <MemberS.StatusLabel isConnected={isConnected} />
      </MemberS.MemberItemButton>
    </S.SidebarListItem>
  );
}
