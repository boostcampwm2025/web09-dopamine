import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const FormContainer = styled.div`
  width: 450px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: ${theme.colors.gray[50]};
  padding: 20px;
  border-radius: ${theme.radius.medium};
`;

export const ProfileHeader = styled.div`
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Text = styled.p`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.black};
`;
