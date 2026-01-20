'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export type Variant = 'solid' | 'outline';
export type SolidColor = 'white' | 'black' | 'green';

export const ButtonContainer = styled.button<{
  variant: Variant;
  color?: SolidColor;
}>`
  border-radius: ${theme.radius.medium};
  padding-inline: 12px;
  padding-block: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: ${theme.font.weight.bold};
  font-size: ${theme.font.size.medium};

  ${({ variant, color }) => {
    if (variant === 'solid') {
      if (color === 'black') {
        return `
          background-color: black;
          color: white;
          border: 1px solid black;
        `;
      }

      if (color === 'white') {
        return `
          background-color: white;
          color: black;
          border: 1px solid ${theme.colors.gray[200]};
        `;
      }

      if (color === 'green') {
        return `
          background-color: ${theme.colors.green[600]};
          color: white;
          border: 1px solid ${theme.colors.green[600]};
        `;
      }
    }

    if (variant === 'outline') {
      return `
        background-color: transparent;
        color: ${theme.colors.green[600]};
        border: 1px solid ${theme.colors.green[600]};
      `;
    }
  }}

  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
`;
