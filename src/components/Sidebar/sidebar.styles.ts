'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import { IssueStatusType } from './types';

export const Sidebar = styled.aside`
  display: flex;
  flex-flow: column nowrap;
  gap: 16px;
  justify-self: left;
  height: 100%;
  width: 256px;
  padding: 16px 0px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[400]};
  box-shadow: 2px 0 2px -1px rgba(0, 0, 0, 0.1);
`;

export const InputWrapper = styled.div`
  display: flex;
  padding: 0 16px;
  position: relative;

  &:has(input:focus) img {
    visibility: hidden;
  }
`;

export const InputIcon = styled(Image)`
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
`;

//TODO: global css로 분리 필요
export const SrOnly = styled.label`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
`;
export const SidebarInput = styled.input`
  width: 100%;
  padding: 8px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

export const SidebarTitle = styled.span`
  position: relative;
  padding: 0 16px;
  font-size: ${({ theme }) => theme.font.size.medium};
  font-weight: 700;
  letter-spacing: 1px;
`;

export const SidebarList = styled.ul`
  display: flex;
  flex-flow: column nowrap;
  overflow-y: auto;
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
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px 10px 24px;
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

export const StatusLabel = styled.span<{
  status: IssueStatusType;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  font-size: ${theme.font.size.xs};
  color: ${({ theme, status }) => theme.status[status].color};
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme, status }) => theme.status[status].color};
  border-radius: ${({ theme }) => theme.radius.large};
`;
