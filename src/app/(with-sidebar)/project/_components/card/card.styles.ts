'use client';

import styled from '@emotion/styled';
import { boxStyle } from '@/styles/mixins';
import { theme } from '@/styles/theme';

export const CardContainer = styled.div<{ variant: 'header' | 'item' }>`
  ${(props) => props.variant === 'item' && boxStyle}
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${(props) => (props.variant === 'item' ? '20px' : '0')};
  cursor: ${(props) => (props.variant === 'item' ? 'pointer' : 'default')};
  transition: all 0.2s ease;

  ${(props) =>
    props.variant === 'item' &&
    `
    &:hover {
      background-color: ${theme.colors.yellow[50]};
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  `}
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const IconWrapper = styled.div<{ variant: 'header' | 'item' }>`
  width: ${(props) => (props.variant === 'header' ? '40px' : '48px')};
  height: ${(props) => (props.variant === 'header' ? '40px' : '48px')};
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

export const Title = styled.div<{ variant: 'header' | 'item' }>`
  font-size: ${theme.font.size.large};
  font-weight: ${theme.font.weight.bold};
  color: ${(props) =>
    props.variant === 'header' ? theme.colors.gray[800] : theme.colors.gray[900]};
  margin: 0;
`;

export const Subtitle = styled.span`
  font-size: ${theme.font.size.small};
  font-weight: ${theme.font.weight.medium};
  color: ${theme.colors.gray[600]};
`;

export const RightSection = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  color: ${theme.colors.gray[600]};
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`;

export const ArrowIcon = styled.div`
  transform: rotate(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.gray[400]};
`;
