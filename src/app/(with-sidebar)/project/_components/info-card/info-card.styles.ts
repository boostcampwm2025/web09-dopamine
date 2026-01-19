'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const InfoCardContainer = styled.div`
  display: flex;
  align-items: center;
  justify-items: space-between;
`;

export const InfoCardImageWrapper = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.green[50]};
  border-radius: ${theme.radius.small};
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

export const TitleText = styled.div`
  font-size: ${theme.font.size.large};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.gray[800]};
`;

export const RightSection = styled.div`
  margin-left: auto;
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[600]};
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`;
