import styled from '@emotion/styled';
import { VOTE_TYPE } from '@/constants/issue';
import { theme } from '@/styles/theme';
import { CardStatus } from '../../types/idea';

export const Card = styled.article<{
  status?: CardStatus;
  isDragging?: boolean;
  inCategory?: boolean;
  isHighlighted?: boolean;
}>`
  position: relative;
  border-radius: ${theme.radius.medium};
  padding: 35px 35px 30px 35px;
  box-shadow: 0 4px 10px rgba(31, 41, 55, 0.06);
  ${({ status }) => {
    switch (status) {
      case 'needDiscussion':
        return `
        border: 2px solid ${theme.colors.red[600]};
        background: ${theme.colors.white};
        box-shadow: 0 4px 10px rgba(236, 0, 0, 0.77);
        `;
      case 'selected':
        return `
        border: 2px solid ${theme.colors.yellow[500]};
        background: ${theme.colors.yellow[50]};
        box-shadow: 0 4px 10px rgba(250, 204, 21, 0.86);
        `;
      case 'default':
      default:
        return `
        border: 1px solid ${theme.colors.gray[200]};
        background: ${theme.colors.white};
        box-shadow: 0 4px 10px rgba(31, 41, 55, 0.06);
        `;
    }
  }}
  ${({ isHighlighted }) =>
    isHighlighted
      ? `
        outline: 3px solid rgba(17, 24, 39, 0.35);
        outline-offset: 2px;
      `
      : ''}
  min-width: 30em;
  max-width: 30em;

  /* 등장 애니메이션 */
  @keyframes ideaCardAppear {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.02);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  position: relative;
`;

export const Badge = styled.div`
  position: absolute;
  top: -20px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 10px 16px;
  background: ${theme.colors.yellow[500]};
  color: ${theme.colors.white};
  border-radius: ${theme.radius.large};
  box-shadow: 0 6px 18px rgba(18, 18, 14, 0.18);
  font-weight: 800;
`;

export const Content = styled.pre`
  min-height: ${theme.font.size.xl};
  font-size: ${theme.font.size.large};
  font-weight: 700;
  color: ${theme.colors.gray[900]};
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
`;

export const EditableInput = styled.textarea`
  width: 100%;
  min-height: ${theme.font.size.xl};
  border: none;
  outline: none;
  resize: none;
  font-size: ${theme.font.size.large};
  font-weight: 700;
  color: ${theme.colors.gray[900]};
  background: transparent;
  font-family: inherit;
  letter-spacing: 0;
  padding: 0;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;

  &::placeholder {
    color: ${theme.colors.gray[900]};
    opacity: 0.4;
    font-weight: 700;
  }
`;

export const Meta = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 42px;
  margin-top: 10px;
`;

export const AuthorPill = styled.span`
  background: ${theme.colors.gray[100]};
  color: ${theme.colors.gray[400]};
  padding: 8px 14px;
  border-radius: ${theme.radius.large};
  font-weight: 600;
  font-size: ${theme.font.size.small};
`;

export const SubmitButton = styled.button`
  margin-left: auto;
  width: 60px;
  height: 40px;
  border: 1px solid ${theme.colors.green[600]};
  border-radius: ${theme.radius.small};
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.green[600]};
  background-color: ${theme.colors.white};
  letter-spacing: 1px;

  &:hover {
    background-color: ${theme.colors.green[100]};
  }
`;
export const IconButton = styled.button`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  width: 42px;
  height: 42px;
  border-radius: ${theme.radius.medium};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${theme.colors.gray[100]};
  }
`;

export const DeleteButton = styled(IconButton)`
  position: absolute;
  top: -28px;
  right: -28px;
  width: 30px;
  height: 30px;
  border: none;
`;

export const Footer = styled.div`
  display: flex;
  gap: 12px;
  border-top: 1px solid ${theme.colors.gray[200]};
  margin-top: 20px;
  padding-top: 20px;
`;

export const VoteButton = styled.button<{
  kind: typeof VOTE_TYPE.AGREE | typeof VOTE_TYPE.DISAGREE;
  active?: boolean;
  cardStatus?: CardStatus;
}>`
  flex: 1;
  padding: 14px 18px;
  border-radius: ${theme.radius.medium};
  border: none;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;

  ${({ kind, active, cardStatus }) => {
    if (kind === VOTE_TYPE.AGREE) {
      if (cardStatus === 'selected') {
        return `background: ${theme.colors.yellow[50]}; color: ${theme.colors.yellow[700]}; box-shadow: inset 0 -2px 0 rgba(250,204,21,0.15);`;
      }
      if (active) {
        return `background: ${theme.colors.green[600]}; color: ${theme.colors.white};`;
      }
      return `background: ${theme.colors.green[100]}; color: ${theme.colors.green[600]};`;
    }

    if (active) {
      return `background: ${theme.colors.red[600]}; color: ${theme.colors.white};`;
    }
    return `background: ${theme.colors.red[100]}; color: ${theme.colors.red[500]};`;
  }}

  &:hover {
    ${({ kind, active, cardStatus }) => {
      if (active || cardStatus === 'selected') return '';
      if (kind === VOTE_TYPE.AGREE)
        return `background: ${theme.colors.green[600]}; color: ${theme.colors.white};`;
      return `background: ${theme.colors.red[200]}; color: ${theme.colors.red[600]};`;
    }}
  }

  &:disabled {
    pointer-events: none;
  }
`;
