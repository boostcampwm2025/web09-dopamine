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
