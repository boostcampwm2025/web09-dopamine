import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const MypageHeaderContainer = styled.div`
  height: 64px;
  padding-inline: 16px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1px solid ${theme.colors.gray[100]};
`;

export const BackButtonWrapper = styled.button`
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
`;

export const BackButtonText = styled.span`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.gray[400]};
`;

export const Title = styled.h1`
  text-align: center;
  font-size: ${theme.font.size.xxl};
  font-weight: ${theme.font.weight.bold};
  color: black;
  margin: 0;
`;
