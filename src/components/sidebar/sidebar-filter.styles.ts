'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  position: relative;
`;

export const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  font-size: ${theme.font.size.small};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.gray[600]};
  cursor: pointer;
  padding: 4px;
  white-space: nowrap;

  &:hover {
    color: ${theme.colors.gray[800]};
  }

  &::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid currentColor;
    margin-top: 2px;
  }
`;

export const Menu = styled.ul`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  list-style: none;
  padding: 4px;
  z-index: 10;
  min-width: 80px;
`;

export const MenuItem = styled.li<{ isActive?: boolean }>`
  width: 100%;

  button {
    width: 100%;
    text-align: left;
    padding: 8px 12px;
    background-color: ${({ isActive, theme }) => (isActive ? theme.colors.gray[200] : 'transparent')};
    border: none;
    border-radius: 4px;
    font-size: ${theme.font.size.small};
    color: ${({ isActive, theme }) => (isActive ? theme.colors.gray[900] : theme.colors.gray[600])};
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background-color: ${({ isActive, theme }) => (isActive ? theme.colors.gray[200] : theme.colors.gray[100])};
      color: ${theme.colors.gray[900]};
    }
  }
`;
