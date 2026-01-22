'use client';

import styled from '@emotion/styled';
import { Container } from '@/components/error/error.styles';
import { theme } from '@/styles/theme';

export * from '@/components/error/error.styles';

export const InviteContainer = styled(Container)`
  background-color: ${theme.colors.gray[50]};
`;

export const InviteMain = styled.div`
  position: relative;
  width: 380px;
  padding: 2rem;
  background-color: ${theme.colors.green[100]};
  border-radius: ${theme.radius.large};
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
`;

export const StrongText = styled.strong`
  font-weight: ${theme.font.weight.semibold};
`;
