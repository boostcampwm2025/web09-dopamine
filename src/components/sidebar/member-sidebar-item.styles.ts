import styled from '@emotion/styled';
import { MEMBER_ROLE } from '@/constants/issue';
import { theme } from '@/styles/theme';

export const MemberItemButton = styled.button<{ hasOnClick?: boolean }>`
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

export const NameContainer = styled.div<{ isConnected: boolean }>`
  display: flex;
  gap: 4px;
  align-items: center;
  color: ${({ isConnected }) => !isConnected && theme.colors.gray[400]};
`;

export const StatusLabel = styled.div<{ isConnected: boolean }>`
  background-color: ${({ isConnected }) =>
    isConnected ? theme.colors.green[600] : theme.colors.gray[400]};
  border-radius: ${theme.radius.full};
  width: 8px;
  height: 8px;
`;
