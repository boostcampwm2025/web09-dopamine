'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const FilterPanel = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

export const Btn = styled.button<{ $variant: 'most-liked' | 'hot-potato' | 'none' }>`
  border-radius: ${theme.radius.medium};
  padding: 10px;

  ${({ $variant }) => {
    // Record 타입을 사용하여 키는 type과 동일하고 값은 객체임을 명시
    const styles: Record<'most-liked' | 'hot-potato' | 'none', { main: string; bg: string }> = {
      'most-liked': {
        main: theme.colors.green[500],
        bg: theme.colors.green[200],
      },
      'hot-potato': {
        main: theme.colors.red[500],
        bg: theme.colors.red[200],
      },
      'none': {
        main: theme.colors.gray[500],
        bg: theme.colors.gray[200],
      },
    };

    const current = styles[$variant as keyof typeof styles];
    return `
      border: 2px solid ${current.main};
      background: ${current.bg};
      color: ${current.main};
    `;
  }}
`;
