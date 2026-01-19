import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Window = styled.section`
  position: fixed;
  z-index: 1100;
  min-width: 260px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  background: ${theme.colors.white};
  border-radius: ${theme.radius.medium};
  border: 1px solid ${theme.colors.gray[200]};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: ${theme.colors.gray[50]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
`;

export const Title = styled.span`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.semibold};
  color: ${theme.colors.gray[800]};
`;

export const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const CloseButton = styled.button`
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: ${theme.colors.gray[500]};
  line-height: 1;
  padding: 2px 6px;

  &:hover {
    color: ${theme.colors.black};
  }
`;

export const Body = styled.div`
  padding: 16px;
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[700]};
  overflow: auto;
`;
