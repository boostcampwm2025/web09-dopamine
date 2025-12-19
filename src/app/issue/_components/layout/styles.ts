'use client';

import Link from 'next/link';
import styled from '@emotion/styled';

export const Wrapper = styled.div`
  display: flex;
  padding: 0 16px;
  margin: 8px 0;
`;

// Link인지 button인지 헷갈리네요
export const IssueGraphLink = styled(Link)`
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
  border-radius: ${({ theme }) => theme.radius.medium};
  box-shadow: 0 4px 4px -1px rgba(0, 0, 0, 0.2);
`;

export const NewIssueButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background-color: ${({ theme }) => theme.colors.green[600]};
  border: none;
  border-radius: ${({ theme }) => theme.radius.half};
  box-shadow: 0 4px 4px -1px rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;
