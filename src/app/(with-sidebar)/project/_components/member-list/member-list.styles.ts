'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const MemberListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const MemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${theme.radius.medium};
  background-color: ${theme.colors.gray[50]};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.gray[100]};
    transform: translateX(4px);
  }
`;

export const ProfileImageWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${theme.radius.full};
  overflow: hidden;
  flex-shrink: 0;
  transition: border-color 0.2s ease;
`;

export const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

export const MemberName = styled.span`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.medium};
  color: ${theme.colors.gray[800]};
`;

export const OwnerBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background-color: ${theme.colors.yellow[100]};
  border-radius: ${theme.radius.small};
`;

export const OwnerText = styled.span`
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.yellow[700]};
`;
