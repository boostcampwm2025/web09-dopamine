'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border-radius: ${theme.radius.large};
  background-color: transparent;
  border: none;
  text-align: center;
`;

export const AddButton = styled.button`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 1px solid ${theme.colors.gray[200]};
  background-color: ${theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: ${theme.font.size.large};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.gray[900]};
`;

export const Description = styled.p`
  margin: 0;
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.medium};
  color: ${theme.colors.gray[600]};
  max-width: 520px;
  line-height: 1.5;
`;
