import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 16px;
`;

export const Dialog = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.radius.medium};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: min(560px, 100%);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid ${theme.colors.gray[100]};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.black};
`;

export const Body = styled.div`
  padding: 18px;
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[700]};
  line-height: 1.6;
  overflow: auto;
  white-space: pre-wrap;
`;

export const CloseButton = styled.button`
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: ${theme.colors.gray[500]};
  line-height: 1;
  padding: 4px;

  &:hover {
    color: ${theme.colors.black};
  }
`;
