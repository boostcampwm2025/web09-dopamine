import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FormInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FormInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FormInputTitle = styled.label`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.semibold};
  color: ${theme.colors.gray[900]};
`;

export const FormInputRow = styled.div`
  position: relative;
`;

export const FormInput = styled.input`
  width: 100%;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.radius.medium};
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[900]};
  box-sizing: border-box;
  background-color: ${theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${theme.colors.green[600]};
  }

  &:disabled {
    background-color: ${theme.colors.gray[50]};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
`;

export const FormTextarea = styled.textarea`
  width: 100%;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.radius.medium};
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[900]};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.green[600]};
  }
`;

export const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

export const FormSubmitButton = styled.button`
  border: none;
  border-radius: ${theme.radius.medium};
  background: ${theme.colors.green[600]};
  color: ${theme.colors.white};
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.bold};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background: ${theme.colors.green[700]};
  }

  &:disabled {
    background-color: ${theme.colors.gray[300]};
    cursor: not-allowed;
  }
`;
