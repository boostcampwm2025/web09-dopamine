'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const HeaderContainer = styled.div`
  height: 64px;
  padding-inline: 16px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

export const LeftSection = styled.div`
  gap: 12px;
  display: flex;
  font-size: ${theme.font.size.large};
  font-weight: ${theme.font.weight.semibold};
  color: black;
  align-items: center;
  justify-self: start;
`;

export const RightSection = styled.div`
  gap: 8px;
  display: flex;
  align-items: center;
  justify-self: end;
  margin-right: 8px;
`;

export const Divider = styled.div`
  height: 16px;
  width: 1px;
  background-color: ${theme.colors.gray[200]};
  margin-left: 4px;
  margin-right: 4px;
`;

export const Profile = styled.div`
  display: flex;
  gap: 12px;
  font-weight: ${theme.font.weight.semibold};
  align-items: center;
  cursor: pointer;
  min-width: 92px;
`;
