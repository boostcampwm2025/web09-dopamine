import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const InputTitle = styled.div`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.semibold};
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Input = styled.input`
  width: 100%;
  border: 1px solid ${theme.colors.gray[300]};
  padding: 12px 8px;
  border-radius: 6px;
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[900]};
  box-sizing: border-box;

  &:focus {
    outline: none;
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

export const SubmitButton = styled.button`
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: ${theme.radius.medium};
  background: ${theme.colors.green[600]};
  color: ${theme.colors.white};
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.green[700]};
  }
`;
