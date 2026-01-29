'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const FilterPanel = styled.div`
  position: fixed;
  top: 100px;
  left: 300px;
  z-index: ${theme.zIndex.sticky};
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

export const Btn = styled.button<{ $selected: boolean }>`
  border-radius: ${theme.radius.large};
  padding: 10px;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  &:hover {
    transform: translateY(-1px);
  }
  font-size: ${theme.font.size.small};
  ${({ $selected }) => `
    border: ${$selected ? '2px' : '1px'} solid ${theme.colors.blue[400]};
    background: ${$selected ? theme.colors.blue[100] : theme.colors.white};
    color: ${$selected ? theme.colors.blue[800] : theme.colors.blue[600]};
  `}
`;
