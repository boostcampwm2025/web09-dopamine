import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 0 20px;
`;

export const ActionButton = styled.button<{ variant: 'logout' | 'delete' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.medium};

  color: ${({ variant }) =>
    variant === 'logout' ? theme.colors.gray[400] : theme.colors.red[400]};

  &:hover {
    color: ${({ variant }) =>
      variant === 'logout' ? theme.colors.gray[600] : theme.colors.red[600]};
  }
`;
