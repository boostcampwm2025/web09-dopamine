'use client';

import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';
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

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

const skeletonBackground = css`
  background: linear-gradient(
    90deg,
    ${theme.colors.gray[50]} 0%,
    ${theme.colors.gray[100]} 50%,
    ${theme.colors.gray[50]} 100%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;

export const SkeletonCard = styled.div`
  border: 1px dashed ${theme.colors.gray[200]};
  background-color: white;
  border-radius: ${theme.radius.large};
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  pointer-events: none;
`;

export const SkeletonIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.radius.small};
  ${skeletonBackground}
  flex-shrink: 0;
`;

export const SkeletonContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const SkeletonLine = styled.div<{ width?: string }>`
  height: 14px;
  width: ${(props) => props.width ?? '100%'};
  border-radius: 8px;
  ${skeletonBackground}
`;

export const SkeletonRight = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  ${skeletonBackground}
  flex-shrink: 0;
`;
