'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const FilterPanel = styled.div`
  position: fixed;
  top: 100px;
  left: 300px;
  z-index: 9999;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

export const Btn = styled.button<{ $selected: boolean }>`
  border-radius: ${theme.radius.medium};
  border: 2px solid ${theme.colors.gray[400]};
  padding: 10px;
  transition: transform 120ms ease, box-shadow 120ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  ${({ $selected }) => `
    border: 2px solid ${$selected ? theme.colors.gray[400] : theme.colors.gray[100]};
    background: ${$selected ? theme.colors.gray[200] : theme.colors.gray[50]};
    color: ${$selected ? theme.colors.gray[800] : theme.colors.gray[600]};
  `}
`;
