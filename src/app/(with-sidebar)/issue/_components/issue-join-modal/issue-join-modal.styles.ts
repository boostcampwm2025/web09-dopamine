'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 400px;
`;

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InputTitle = styled.label`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.semibold};
  color: ${theme.colors.gray[900]};
`;

export const Input = styled.div`
  position: relative;
  width: 100%;
`;

export const InputField = styled.input`
  width: 100%;
  padding: 12px 44px 12px 16px;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.radius.medium};
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[900]};
  background-color: ${theme.colors.white};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.green[600]};
  }

  &:disabled {
    background-color: ${theme.colors.gray[50]};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
`;

export const CharCount = styled.span<{ $isOverLimit?: boolean }>`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: ${theme.font.size.small};
  font-weight: ${theme.font.weight.semibold};
  color: ${({ $isOverLimit }) => ($isOverLimit ? theme.colors.red[500] : theme.colors.gray[600])};
  pointer-events: none;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
`;

export const SubmitButton = styled.button`
  padding: 12px 24px;
  background-color: ${theme.colors.green[600]};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.radius.medium};
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.bold};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${theme.colors.green[700]};
  }

  &:disabled {
    background-color: ${theme.colors.gray[300]};
    cursor: not-allowed;
  }
`;
