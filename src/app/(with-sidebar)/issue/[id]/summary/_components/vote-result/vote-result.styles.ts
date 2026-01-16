import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 30px;
  height: 100%;
`;

export const VoteBox = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${theme.radius.medium};
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 20px 0;
  gap: 10px;
`;

export const TableRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
`;

export const divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${theme.colors.gray[200]};
`;

export const OptionText = styled.span`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.regular};
  color: ${theme.colors.gray[700]};
`;

export const VoteCountText = styled.span<{ highlight?: boolean }>`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.bold};
  color: ${({ highlight }) => (highlight ? theme.colors.green[600] : theme.colors.black)};
`;
