import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 30px;
`;

export const VoteBox = styled.div`
  height: 240px;
  width: 100%;
  border-radius: ${theme.radius.medium};
  display: flex;
  justify-content: center;
  align-items: center;
`;