import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Window = styled.section`
  position: absolute;
  bottom: -340px;
  right: -400px;
  transform-origin: top left;
  width: 420px;
  height: 500px;
  min-width: 260px;
  max-width: calc(100vw - 32px);
  max-height: min(800px, calc(100vh - 32px));
  background: ${theme.colors.white};
  border-radius: ${theme.radius.medium};
  border: 1px solid ${theme.colors.gray[200]};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
  z-index: ${theme.zIndex.important};
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: ${theme.colors.gray[50]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  cursor: default;
`;

export const Title = styled.span`
  font-size: ${theme.font.size.large};
  font-weight: ${theme.font.weight.semibold};
  color: ${theme.colors.gray[800]};
  padding-left: 12px;
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
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: default;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CommentSection = styled(Section)`
  flex: 1;
  min-height: 0;
`;

export const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const CommentItem = styled.div`
  padding: 14px 14px;
  position: relative;
  border-bottom: 1px solid ${theme.colors.gray[100]};

  &:last-child {
    border-bottom: none;
  }
`;

export const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`;

export const CommentMeta = styled.div`
  font-size: ${theme.font.size.small};
  color: ${theme.colors.gray[500]};
  font-weight: 500;
`;

export const CommentActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const CommentBody = styled.div<{ $isClamped: boolean }>`
  font-size: 15px;
  color: ${theme.colors.gray[900]};
  line-height: 1.6;
  max-width: 100%;
  white-space: pre-wrap;
  word-break: break-word;

  ${({ $isClamped }) =>
    $isClamped
      ? `
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `
      : ''}
`;

export const CommentMeasure = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  visibility: hidden;
  pointer-events: none;
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  height: auto;
  overflow: visible;
`;

export const ReadMoreButton = styled.button`
  margin-top: 8px;
  border: none;
  background: transparent;
  color: ${theme.colors.blue[600]};
  font-size: ${theme.font.size.small};
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

export const EditInput = styled.textarea`
  width: 100%;
  min-height: 84px;
  padding: 10px 12px;
  border-radius: ${theme.radius.small};
  border: 1px solid ${theme.colors.gray[200]};
  font-size: ${theme.font.size.medium};
  resize: vertical;

  &:focus {
    outline: 2px solid ${theme.colors.blue[200]};
    border-color: ${theme.colors.blue[400]};
  }
`;

export const Btn = styled.button<{ $variant?: 'default' | 'danger' }>`
  border: none;
  background: transparent;
  color: ${({ $variant }) =>
    $variant === 'danger' ? theme.colors.gray[400] : theme.colors.gray[400]};
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  padding: 2px 4px;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ $variant }) =>
      $variant === 'danger' ? theme.colors.red[600] : theme.colors.gray[700]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ConfirmBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ConfirmMessage = styled.p`
  margin: 0;
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[700]};
`;

export const ConfirmActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

export const ConfirmButton = styled.button`
  padding: 8px 14px;
  border-radius: ${theme.radius.small};
  border: 1px solid ${theme.colors.gray[200]};
  background: ${theme.colors.white};
  color: ${theme.colors.gray[700]};
  font-size: ${theme.font.size.small};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.gray[100]};
  }
`;

export const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.radius.small};
  padding: 10px 12px;
`;

export const Input = styled.textarea`
  padding: 10px 12px;
  border: none;
  font-size: ${theme.font.size.medium};
  line-height: 1.5;
  min-height: calc(1.5em + 20px);
  max-height: calc(1.5em * 5 + 20px);
  overflow-y: hidden;
  resize: none;

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
