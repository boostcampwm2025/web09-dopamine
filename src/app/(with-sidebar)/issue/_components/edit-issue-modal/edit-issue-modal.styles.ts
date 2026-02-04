import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const DeleteButton = styled.button`
  display: inline-flex;
  flex-flow: column nowrap;
  align-items: center;
  width: 60px;
  color: ${theme.colors.red[500]};

  &:hover {
    opacity: 0.7;
  }
`;
