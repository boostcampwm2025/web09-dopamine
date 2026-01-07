import styled from '@emotion/styled';

const Card = styled.article<{
  status?: 'needDiscussion' | 'selected' | 'default';
  isDragging?: boolean;
  inCategory?: boolean;
}>`
  position: relative;
  border-radius: 12px;
  padding: 35px;
  box-shadow: 0 4px 10px rgba(31, 41, 55, 0.06);
  ${({ status }) => {
    switch (status) {
      case 'needDiscussion':
        return `
        border: 2px solid #EC0000;
        background: #ffffff; 
        box-shadow: 0 4px 10px rgba(236, 0, 0, 0.77);
        `;
      case 'selected':
        return `
        border: 2px solid #fccf1cff;
        background: #FEFCE8;
        box-shadow: 0 4px 10px rgba(250, 204, 21, 0.86);
        `;
      case 'default':
      default:
        return `
        border: 1px solid #E5E7EB;
        background: #ffffff; 
        box-shadow: 0 4px 10px rgba(31, 41, 55, 0.06);
        `;
    }
  }}
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

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const Badge = styled.div`
  position: absolute;
  top: -20px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 10px 16px;
  background: #facc15;
  color: #ffffff;
  border-radius: 24px;
  box-shadow: 0 6px 18px rgba(18, 18, 14, 0.18);
  font-weight: 800;
`;

const Content = styled.h3`
  min-height: 45px;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
`;

const EditableInput = styled.textarea`
  width: 100%;
  min-height: 45px;
  border: none;
  outline: none;
  resize: none;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  background: transparent;
  font-family: inherit;
  letter-spacing: 0;
  padding: 0;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;

  &::placeholder {
    color: rgba(17, 24, 39, 0.4);
    font-weight: 700;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const AuthorPill = styled.span`
  background: #f3f4f6;
  color: #9ca3af;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
`;

const IconButton = styled.button`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const Divider = styled.hr`
  border: none;

  height: 1px;
  background: #f3f4f6;
  margin: 20px 0;
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
`;

const VoteButton = styled.button<{
  kind: 'agree' | 'disagree';
  active?: boolean;
  cardStatus?: 'needDiscussion' | 'selected' | 'default';
}>`
  flex: 1;
  padding: 14px 18px;
  border-radius: 12px;
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
    if (kind === 'agree') {
      if (cardStatus === 'selected') {
        return `background: #FEF9C3; color: #A16207; box-shadow: inset 0 -2px 0 rgba(250,204,21,0.15);`;
      }
      if (active) {
        return `background: #059669; color: #ffffff;`;
      }
      return `background: #F0FDF4; color: #059669;`;
    }

    if (active) {
      return `background: #DC2626; color: #ffffff;`;
    }
    return `background: #f3f4f6; color: #6b7280;`;
  }}

  &:hover {
    ${({ kind, active, cardStatus }) => {
      if (active || cardStatus === 'selected') return '';
      if (kind === 'agree') return `background: #059669; color: #ffffff;`;
      return `background: #e5e7eb; color: #374151;`;
    }}
  }
`;

export {
  Card,
  Header,
  Content,
  EditableInput,
  Meta,
  AuthorPill,
  IconButton,
  Divider,
  Footer,
  VoteButton,
  Badge,
};
