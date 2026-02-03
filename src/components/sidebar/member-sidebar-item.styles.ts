import styled from '@emotion/styled';
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

export const NameContainer = styled.div<{ isConnected?: boolean }>`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  color: ${({ isConnected }) => isConnected == false && theme.colors.gray[400]};
`;

export const CurrentUserLabel = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.semibold};
  line-height: 1;
  color: ${theme.colors.green[600]};
  background-color: ${theme.colors.green[100]};
  border: 1px solid ${theme.colors.green[600]};
  border-radius: ${theme.radius.large};
`;

export const StatusLabel = styled.div<{ isConnected?: boolean }>`
  background-color: ${({ isConnected }) =>
    isConnected ? theme.colors.green[600] : theme.colors.gray[400]};
  border-radius: ${theme.radius.full};
  width: 8px;
  height: 8px;
`;

export const OwnerBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background-color: ${theme.colors.yellow[100]};
  border-radius: ${theme.radius.small};
`;

export const OwnerText = styled.span`
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.yellow[700]};
`;

export const EditInput = styled.input`
  padding: 4px 8px;
  font-size: ${theme.font.size.medium};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.radius.small};
  width: 120px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.green[600]};
  }
`;

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.gray[500]};
  border-radius: ${theme.radius.small};

  &:hover {
    background-color: ${theme.colors.gray[200]};
    color: ${theme.colors.gray[900]};
  }
`;

export const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
`;
