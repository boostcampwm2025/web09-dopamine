import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

interface CanvasContainerProps {
  showGrid?: boolean;
}

interface CanvasViewportProps {
  boundContent?: boolean;
}

export const CanvasContainer = styled.div<CanvasContainerProps>`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  ${({ showGrid }) =>
    showGrid &&
    `
    background:
      linear-gradient(90deg, ${theme.colors.gray[100]} 1px, transparent 1px),
      linear-gradient(${theme.colors.gray[100]} 1px, transparent 1px);
    background-size: 40px 40px;
    background-position: 0 0;
    background-color : ${theme.colors.gray[50]};
  `}
`;

export const CanvasViewport = styled.div<CanvasViewportProps>`
  position: relative;
  width: ${({ boundContent }) => (boundContent ? 'auto' : '4000px')};
  height: ${({ boundContent }) => (boundContent ? 'auto' : '4000px')};
  transform-origin: 0 0;
  transition: transform 0.05s ease-out;
`;

export const ZoomControls = styled.div`
  position: fixed;
  top: 80px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: ${theme.zIndex.sticky};
`;

export const ZoomButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: ${theme.radius.medium};
  border: none;
  background: ${theme.colors.white};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  font-size: 14px;

  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.gray[900]};
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05);
    background: ${theme.colors.gray[50]};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const BottomMessage = styled.div`
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: transparent;
  color: ${theme.colors.gray[500]};
  padding: 8px 16px;
  border-radius: ${theme.radius.medium};
  font-size: 15px;
`;

export const AddIdeaButton = styled.button`
  position: fixed;
  bottom: 50px;
  right: 30px;
  padding: 12px 24px;
  background-color: ${theme.colors.green[600]};
  color: white;
  border: none;
  border-radius: ${theme.radius.large};
  font-size: 16px;
  font-weight: ${theme.font.weight.bold};
  cursor: pointer;
  box-shadow: 0 12px 16px rgba(0, 0, 0, 0.3);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;
