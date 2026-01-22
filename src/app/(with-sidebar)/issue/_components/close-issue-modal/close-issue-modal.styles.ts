import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const InfoBox = styled.div`
  border: 1px solid ${theme.colors.gray[100]};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.radius.medium};
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.span`
  font-size: ${theme.font.size.small};
  color: ${theme.colors.gray[500]};
  font-weight: 600;
`;

export const Content = styled.div`
  color: ${theme.colors.gray[900]};
  font-weight: 600;
  white-space: pre-wrap;
`;

export const Meta = styled.span`
  font-size: ${theme.font.size.small};
  color: ${theme.colors.gray[500]};
`;

export const Empty = styled.div`
  color: ${theme.colors.gray[500]};
  font-size: ${theme.font.size.small};
`;

export const MemoLabel = styled.label`
  font-size: ${theme.font.size.small};
  color: ${theme.colors.gray[600]};
  font-weight: 600;
`;

export const MemoInputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.radius.medium};
  padding: 8px 0;
`;

export const MemoInput = styled.textarea`
  width: 100%;
  height: 100%;
  min-height: 120px;
  border: none;
  padding: 4px 12px;
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[900]};
  resize: none;
  outline: none;
  box-sizing: border-box;

  &:focus {
    outline: none;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: ${theme.radius.medium};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.gray[300]};
    border-radius: ${theme.radius.medium};
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SubmitButton = styled.button`
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: ${theme.radius.small};
  background: ${theme.colors.green[600]};
  color: ${theme.colors.white};
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.green[700]};
  }
`;
