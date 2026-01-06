'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const HeaderContainer = styled.div`
  height: 64px;
  padding-inline: 16px;
  background-color: white;
  display: grid;
  grid-template-columns: 1fr 2fr 1.2fr;
  align-items: center;
  border-bottom: 1px solid ${theme.colors.gray[100]};
`;

export const LeftSection = styled.div`
  gap: 12px;
  display: flex;
  font-size: ${theme.font.size.body2};
  font-weight: ${theme.font.weight.semibold};
  color: black;
  align-items: center;
  justify-self: start;
`;

export const CenterSection = styled.div`
  justify-self: center;
  width: clamp(10rem, 100%, 40rem);
`;

export const RightSection = styled.div`
  gap: 8px;
  display: flex;
  align-items: center;
  justify-self: end;
`;
