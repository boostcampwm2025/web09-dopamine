import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const TextFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Label = styled.label`
  font-size: ${theme.font.size.small};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.gray[400]};
`;

export const InputWrapper = styled.div<{ $isReadOnly?: boolean; $isFocused?: boolean }>`
  background-color: ${({ $isReadOnly }) =>
    $isReadOnly ? theme.colors.gray[100] : theme.colors.white};
  border: 1px solid
    ${({ $isFocused, $isReadOnly }) =>
      !$isReadOnly && $isFocused ? theme.colors.green[500] : theme.colors.gray[200]};
  border-radius: ${theme.radius.small};
  padding: 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Input = styled.input`
  border: none;
  border-radius: 0;
  outline: none;
  background-color: transparent;
  width: 100%;
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.regular};
  color: ${theme.colors.gray[900]};

  &:disabled {
    color: ${theme.colors.gray[500]};
    cursor: not-allowed;
  }
`;

export const Description = styled.p`
  font-size: ${theme.font.size.small};
  font-weight: ${theme.font.weight.regular};
  color: ${theme.colors.gray[400]};
  margin-top: 4px;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.gray[400]};
  width: 14px;
  height: 14px;

  &.active {
    color: ${theme.colors.green[500]};
  }
`;
