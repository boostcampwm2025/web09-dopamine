'use client';

import Link from 'next/link';
import styled from '@emotion/styled';

export const Wrapper = styled.div`
  display: flex;
  padding: 0 16px;
  margin: 8px 0;
`;

export const StyledIssueGraphLink = styled(Link)`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 0;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.font.size.medium};
  font-weight: 700;
  text-decoration: none;
  background-color: ${({ theme }) => theme.colors.green[600]};
  border-radius: ${({ theme }) => theme.radius.small};
  box-shadow: 0 4px 4px -1px rgba(0, 0, 0, 0.2);
`;
