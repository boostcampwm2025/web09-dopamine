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

export const InputRow = styled.div`
  position: relative;
`;

export const Input = styled.input`
  width: 100%;
  border: 1px solid ${theme.colors.gray[300]};
  padding: 12px 44px 12px 8px;
  border-radius: ${theme.radius.small};
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[900]};
  box-sizing: border-box;

  &:focus {
    outline: none;
  }
  resize: none;
`;

export const InputDescription = styled.div`
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.red[500]};
`;

export const CharCount = styled.span<{ $isOverLimit: boolean }>`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: ${theme.font.size.small};
  font-weight: ${theme.font.weight.semibold};
  color: ${({ $isOverLimit }) => ($isOverLimit ? theme.colors.red[500] : theme.colors.gray[600])};
  pointer-events: none;
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
