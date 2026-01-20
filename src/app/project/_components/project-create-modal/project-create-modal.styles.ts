import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export * from '@/components/modal/issue-create-modal/issue-create-modal.styles';

export const CancelButton = styled.button`
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: ${theme.radius.medium};
  color: ${theme.colors.gray[700]};
  font-weight: ${theme.font.weight.bold};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.gray[100]};
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 8px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.radius.small};
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[900]};
  resize: vertical;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
  }
`;
