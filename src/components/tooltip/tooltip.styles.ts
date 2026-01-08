import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  padding: 12px;
  border-radius: ${theme.radius.medium};
  font-size: ${theme.font.size.small};
  color: ${theme.colors.gray[800]};
  background-color: ${theme.colors.yellow[100]};
  z-index: 999;
  pointer-events: none;
  font-weight: ${theme.font.weight.medium};
`;

export const Arrow = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: ${theme.colors.yellow[100]};
  transform: rotate(45deg);
`;
