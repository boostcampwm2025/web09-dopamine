'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from '@emotion/styled';
import {
  SIDEBAR_TOGGLE_BORDER_RADIUS,
  SIDEBAR_TOGGLE_HEIGHT,
  SIDEBAR_TOGGLE_WIDTH,
  SIDEBAR_WIDTH,
} from '@/constants/sidebar';
import { theme } from '@/styles/theme';
import { IssueStatus } from '@/types/issue';

export const Sidebar = styled.aside`
  display: flex;
  position: relative;
  flex-flow: column nowrap;
  gap: 16px;
  justify-self: left;
  height: 100%;
  width: ${SIDEBAR_WIDTH}px;
  padding: 16px 0px;
  background-color: ${theme.colors.white};
  color: ${theme.colors.gray[400]};
  box-shadow: 2px 0 2px -1px rgba(0, 0, 0, 0.1);
  overflow-x: visible;
  overflow-y: hidden;
`;

export const SidebarToggle = styled.button`
  position: absolute;
  top: 10%;
  right: -20px;
  transform: translateY(-50%);
  width: ${SIDEBAR_TOGGLE_WIDTH}px;
  height: ${SIDEBAR_TOGGLE_HEIGHT}px;
  padding: 0;
  border: none;
  border-radius: 0 ${SIDEBAR_TOGGLE_BORDER_RADIUS}px ${SIDEBAR_TOGGLE_BORDER_RADIUS}px 0;
  background-color: ${theme.colors.red[500]};
  cursor: pointer;
  z-index: 9999;
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.08);

  &:hover {
    background-color: ${theme.colors.gray[400]};
  }
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0 16px;
  padding: 0;
  gap: 8px;
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

export const SearchBox = styled.div`
  position: relative;
  flex: 1;
`;

export const InputIcon = styled(Image)`
  position: absolute;
  top: 50%;
  right: 0;
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
  padding: 8px 24px 8px 8px;
  border: none;
  outline: none;

  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
`;

export const SidebarTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.bold};
  letter-spacing: 1px;

  & span {
    font-weight: ${theme.font.weight.medium};
    margin-left: 8px;
  }
`;

export const SidebarList = styled.ul`
  display: flex;
  flex-flow: column nowrap;
  flex: 1 1 0;
  overflow-y: auto;
  min-height: 0;
  gap: 4px;
`;
export const SidebarListItem = styled.li`
  display: flex;
  flex-flow: row nowrap;
  flex-shrink: 0;
`;

export const ListItemLink = styled(Link)`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: 100%;
  padding: 10px 16px 10px 24px;
  background-color: ${theme.colors.white};
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[700]};
  border: none;
  text-decoration: none;
  gap: 8px;

  &:hover,
  &:focus {
    background-color: ${theme.colors.gray[200]};
  }
`;

export const StatusLabel = styled.span<{
  status: IssueStatus;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  font-size: ${theme.font.size.xs};
  color: ${({ status }) => theme.status[status].color};
  background-color: ${theme.colors.white};
  border: 1px solid ${({ status }) => theme.status[status].color};
  border-radius: ${theme.radius.large};
  margin-left: auto;
`;

export const Bullet = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${theme.colors.gray[300]};
  border-radius: ${theme.radius.full};
`;
