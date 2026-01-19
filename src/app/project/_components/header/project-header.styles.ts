'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const HeaderContainer = styled.div`
  height: 56px;
  padding-inline: 144px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const LeftSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const Title = styled.h1`
  font-size: ${theme.font.size.xxl};
  font-weight: ${theme.font.weight.bold};
  color: black;
  margin: 0;
`;

export const RightSection = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

