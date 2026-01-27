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

export const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.radius.medium};
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[900]};
  background-color: ${theme.colors.white};
  outline: none;
  transition: border-color 0.2s;

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
