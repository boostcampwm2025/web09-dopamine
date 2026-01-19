import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Window = styled.section`
  position: absolute;
  z-index: 1100;
  min-width: 260px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  background: ${theme.colors.white};
  border-radius: ${theme.radius.medium};
  border: 1px solid ${theme.colors.gray[200]};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: ${theme.colors.gray[50]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

export const Title = styled.span`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.semibold};
  color: ${theme.colors.gray[800]};
`;

export const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const CloseButton = styled.button`
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: ${theme.colors.gray[500]};
  line-height: 1;
  padding: 2px 6px;

  &:hover {
    color: ${theme.colors.black};
  }
`;

export const Body = styled.div`
  padding: 16px;
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[700]};
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SectionTitle = styled.h4`
  margin: 0;
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.semibold};
  color: ${theme.colors.gray[800]};
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
  margin: 0;
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
