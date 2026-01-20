import { css } from '@emotion/react';
import { theme } from '@/styles/theme';

export const boxStyle = css`
  background-color: ${theme.colors.white};
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.radius.large};
`;
