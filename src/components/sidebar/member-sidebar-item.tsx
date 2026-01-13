import Image from 'next/image';
import styled from '@emotion/styled';
import { MEMBER_ROLE } from '@/constants/issue';
import { theme } from '@/styles/theme';
import * as S from './sidebar.styles';

interface MemberSidebarItemProps {
  name: string;
  role: typeof MEMBER_ROLE.OWNER | typeof MEMBER_ROLE.MEMBER;
  isConnected: boolean;
}

const MemberItemButton = styled.button<{ hasOnClick?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px 10px 24px;
  background-color: ${theme.colors.white};
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[700]};
  border: none;
  text-decoration: none;

  &:hover {
    background-color: ${theme.colors.gray[200]};
  }
`;

const NameContainer = styled.div<{ isConnected: boolean }>`
  display: flex;
  gap: 4px;
  align-items: center;
  color: ${({ isConnected }) => !isConnected && theme.colors.gray[400]};
`;

const StatusLabel = styled.div<{ isConnected: boolean }>`
  background-color: ${({ isConnected }) =>
    isConnected ? theme.colors.green[600] : theme.colors.gray[400]};
  border-radius: ${theme.radius.full};
  width: 8px;
  height: 8px;
`;

export default function MemberSidebarItem({ name, role, isConnected }: MemberSidebarItemProps) {
  return (
    <S.SidebarListItem>
      <MemberItemButton>
        <NameContainer isConnected={isConnected}>
          {role === MEMBER_ROLE.OWNER && (
            <Image
              src="/yellow-crown.svg"
              alt="owner"
              width={18}
              height={18}
            />
          )}
          <span>{name}</span>
        </NameContainer>
        <StatusLabel isConnected={isConnected} />
      </MemberItemButton>
    </S.SidebarListItem>
  );
}
