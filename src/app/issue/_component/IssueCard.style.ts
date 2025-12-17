
import styled from '@emotion/styled';

const Card = styled.article`
  background: #ffffff; 
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(31, 41, 55, 0.06);
  border: 1px solid rgba(31,41,55,0.04);
  max-width: 30em;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const Content = styled.h3`
  margin-bottom: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
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
  color: #374151;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
`;

const IconButton = styled.button`
  background: #ffffff;
  border: 1px solid rgba(31,41,55,0.06);
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
  margin: 16px 0;
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
`;

const VoteButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 14px 18px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  ${({ variant }) =>
    variant === 'primary'
      ? `background: #F0FDF4; hover: #059669 ; color: #059669; box-shadow: inset 0 -2px 0 rgba(5,150,105,0.08);`
      : `background: #f3f4f6; color: #6b7280;`}
  &:hover {
    ${({ variant }) =>
      variant === 'primary'
        ? `background: #059669; color: #fff; box-shadow: inset 0 -2px 0 rgba(5,150,105,0.08);`
        : `background: #e5e7eb; color: #374151;`}
  }
`;

export {
    Card,
    Header,
    Content,
    Meta,
    AuthorPill,
    IconButton,
    Divider,
    Footer,
    VoteButton

}