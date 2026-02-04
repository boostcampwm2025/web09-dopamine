import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const SkeletonGridContainer = styled.div`
  width: 100vw;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.gray[50]};
  position: relative;
`;

export const SkeletonGrid = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
`;

export const SkeletonItem = styled.div<{
  x: number;
  y: number;
  top: number;
  left: number;
}>`
  position: absolute;
  top: ${(props) => props.top}%;
  left: ${(props) => props.left}%;
  transform: translate(${(props) => props.x}px, ${(props) => props.y}px);
  opacity: 0.6;
`;

export const EmptyOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  pointer-events: none;
`;

export const EmptyCard = styled.div`
  width: min(560px, 90vw);
  padding: 40px 32px;
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.radius.large};
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
`;

export const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: ${theme.colors.green[50]};
  border: 1px solid ${theme.colors.green[100]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const EmptyTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.gray[900]};
`;

export const EmptyDescription = styled.p`
  margin: 0;
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.medium};
  color: ${theme.colors.gray[600]};
  line-height: 1.5;
`;

export const EmptyButton = styled.button`
  margin-top: 10px;
  width: 100%;
  max-width: 360px;
  height: 48px;
  border-radius: ${theme.radius.medium};
  border: none;
  background: ${theme.colors.green[600]};
  color: ${theme.colors.white};
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.bold};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(22, 163, 74, 0.25);
`;

export const EmptyContent = styled.div`
  pointer-events: auto;
`;
