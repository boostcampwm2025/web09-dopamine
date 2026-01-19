'use client';

import styled from '@emotion/styled';
import { boxStyle } from '@/styles/mixins';
import { theme } from '@/styles/theme';

export const TopicCardContainer = styled.div`
  ${boxStyle}
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.green[50]};
  border-radius: ${theme.radius.small};
  flex-shrink: 0;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h3`
  font-size: ${theme.font.size.large};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.gray[900]};
  margin: 0;
`;

export const InfoText = styled.span`
  font-size: ${theme.font.size.small};
  font-weight: ${theme.font.weight.medium};
  color: ${theme.colors.gray[600]};
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  color: ${theme.colors.gray[400]};
`;

export const ArrowIcon = styled.div`
  transform: rotate(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
`;
