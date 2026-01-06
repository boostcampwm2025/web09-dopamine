import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Card = styled.div`
  width: 1000px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const BtnContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const Btn = styled.button<{ selected?: boolean }>`
  width: 77px;
  min-height: 32px;
  font-size: ${theme.font.size.small};
  line-height: 20px;
  font-weight: ${theme.font.weight.bold};
  color: ${({ selected }) => (selected ? theme.colors.black : theme.colors.gray[400])};
  border-radius: 14px;
  background-color: ${({ selected }) => (selected ? theme.colors.white : 'none')};
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderTitle = styled.span`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.black}
`;
