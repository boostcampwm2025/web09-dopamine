'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const HeaderContainer = styled.div`
  height: 56px;
  padding-inline: 16px;
  background-color: white;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${theme.colors.gray[100]};
  justify-content: space-between;
`;

export const LeftSection = styled.div`
  gap: 12px;
  display: flex;
  font-size: ${theme.font.size.body2};
  font-weight: ${theme.font.weight.semibold};
  color: black;
  align-items: center;
`;

export const RightSection = styled.div`
  gap: 8px;
  display: flex;
  align-items: center;
`;
