'use client';

import Link from 'next/link';
import styled from '@emotion/styled';

export const Sidebar = styled.aside`
  display: flex;
  flex-flow: column nowrap;
  justify-self: left;
  height: 100%;
  width: 256px;
  padding: 16px 0px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[400]};
  box-shadow: 2px 0 2px -1px rgba(0, 0, 0, 0.1);
`;

export const SidebarTitle = styled.span`
  font-size: ${({ theme }) => theme.font.size.medium};
  font-weight: 700;
  letter-spacing: 1px;
  padding: 16px;
`;

export const SidebarList = styled.ul`
  display: flex;
  flex-flow: column nowrap;
`;
export const SidebarListItem = styled.li`
  display: flex;
  flex-flow: row nowrap;
  flex-grow: 1;
`;

export const ListItemLink = styled(Link)`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 36px;
  padding: 0 24px;
  background-color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.font.size.medium};
  color: ${({ theme }) => theme.colors.gray[700]};
  border: none;
  text-decoration: none;

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.colors.gray[200]};
  }
`;
