import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 80px;
  padding: 60px 80px;
  flex: 1;
  height: fit-content;
  background: ${theme.colors.gray[50]};
`;

export const HeaderTitle = styled.span`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.black}
`;


export const ComponentBox = styled.div<{ flexRatio?: number }>`
  flex: ${({ flexRatio }) => flexRatio ?? 1};
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.radius.medium};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
`;

export const wordCloudAndVoteBox = styled.div`
  display: flex;
  width: 100%;
  gap: 24px;
`;