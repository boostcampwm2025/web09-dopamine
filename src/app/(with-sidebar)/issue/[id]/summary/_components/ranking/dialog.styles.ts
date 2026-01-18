import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 16px;
`;

export const Dialog = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.radius.medium};
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16);
  max-width: 520px;
  width: min(520px, 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const DialogHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid ${theme.colors.gray[100]};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.black};
`;

export const DialogClose = styled.button`
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  color: ${theme.colors.gray[500]};
  line-height: 1;
  padding: 4px;
  &:hover {
    color: ${theme.colors.black};
  }
`;

export const DialogBody = styled.div`
  padding: 16px;
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[600]};
  line-height: 1.6;
  white-space: pre-wrap;
`;
