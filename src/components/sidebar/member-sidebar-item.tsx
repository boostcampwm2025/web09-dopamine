import styled from '@emotion/styled';
import { MEMBER_ROLE } from '@/constants/issue';
import { theme } from '@/styles/theme';
import * as S from './sidebar.styles';

interface MemberSidebarItemProps {
  name: string;
  role: typeof MEMBER_ROLE.OWNER | typeof MEMBER_ROLE.MEMBER;
  onClick?: () => void;
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
  cursor: ${({ hasOnClick }) => (hasOnClick ? 'pointer' : 'default')};

  &:hover,
  &:focus {
    background-color: ${theme.colors.gray[200]};
  }
`;

export default function MemberSidebarItem({ name, role, onClick }: MemberSidebarItemProps) {
  return (
    <S.SidebarListItem>
      <MemberItemButton
        onClick={onClick}
        hasOnClick={!!onClick}
      >
        <span>{name}</span>
        {role === MEMBER_ROLE.OWNER && (
          <S.StatusLabel
            status="SELECT"
            style={{
              fontSize: '10px',
              padding: '2px 6px',
            }}
          >
            OWNER
          </S.StatusLabel>
        )}
      </MemberItemButton>
    </S.SidebarListItem>
  );
}
