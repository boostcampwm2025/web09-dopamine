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

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 0;
    height: 0;
    border: 16px solid transparent;
    border-bottom-color: ${theme.colors.yellow[100]};
    border-top: 0;
    border-left: 0;
    margin-left: -5px;
    margin-top: -16px;
  }
`;
