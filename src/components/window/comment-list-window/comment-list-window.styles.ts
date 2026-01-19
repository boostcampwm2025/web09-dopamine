import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CommentItem = styled.div`
  padding: 12px 14px;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.radius.small};
  background: ${theme.colors.gray[50]};
`;

export const CommentMeta = styled.div`
  font-size: ${theme.font.size.small};
  color: ${theme.colors.gray[500]};
  margin-bottom: 6px;
`;

export const CommentBody = styled.div`
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[800]};
  line-height: 1.5;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.gray[200]};
  margin: 16px 0;
`;

export const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
`;

export const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${theme.radius.small};
  border: 1px solid ${theme.colors.gray[200]};
  font-size: ${theme.font.size.medium};

  &:focus {
    outline: 2px solid ${theme.colors.blue[200]};
    border-color: ${theme.colors.blue[400]};
  }
`;

export const SubmitButton = styled.button`
  padding: 10px 16px;
  border-radius: ${theme.radius.small};
  border: 1px solid ${theme.colors.green[600]};
  background: ${theme.colors.green[100]};
  color: ${theme.colors.green[700]};
  font-weight: ${theme.font.weight.semibold};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.green[200]};
  }
`;