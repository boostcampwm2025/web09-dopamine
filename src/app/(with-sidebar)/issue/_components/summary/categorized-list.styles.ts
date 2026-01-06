import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px; 
  position: relative;
`;

export const ContainerCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 11px;
  background: ${theme.colors.gray[50]};
  border: 2px ${theme.colors.gray[100]} solid;
  border-radius: ${theme.radius.medium};
  padding: 16px;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Title = styled.span`
  color: ${theme.colors.green[600]};
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.bold};
  &::before {
    margin-right: 4px;
    display: inline-block;
    content: "";
    width: 8px;
    height: 8px;
    border-radius: ${theme.radius.half};
    background: ${theme.colors.green[600]};
  }
`;

export const ItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[100]};
  border-radius: ${theme.radius.medium};
  gap: 12px;
  padding: 8px;
`;

export const ItemLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

export const ItemContent = styled.div`
  color: ${theme.colors.gray[500]};
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.regular};
  flex: 1;
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;

export const RankBadge = styled.div<{ highlighted?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: ${theme.radius.small};
  display: grid;
  place-items: center;
  font-weight: 600;
  font-size: ${theme.font.size.small};
  color: ${({highlighted}) => (
    highlighted ? theme.colors.yellow[600] : theme.colors.gray[400]
  )};
  background: ${({highlighted}) => (
    highlighted ? theme.colors.yellow[100] : theme.colors.gray[100]
  )};
`;

export const VoteInfoSection = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const VoteInfo = styled.div<{ type?: 'agree' | 'disagree' }>`
  color: ${({ type }) => (type === 'agree' ? theme.colors.green[600] : theme.colors.red[600])};
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const VoteLabel = styled.span`
  font-size: ${theme.font.size.small};
  font-weight: 400;
  color: ${theme.colors.gray[400]};
  letter-spacing: 0;
  line-height: 16px;
`;

export const VoteCount = styled.span<{ type?: 'agree' | 'disagree' }>`
  font-size: ${theme.font.size.small};
  font-weight: 400;
  color: ${({ type }) => (type === 'agree' ? theme.colors.green[600] : theme.colors.red[600])};
  letter-spacing: 0;
  line-height: 16px;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 0 4px;
`;

export const MoreButton = styled.button`
  color: ${theme.colors.gray[500]};
  font-size: ${theme.font.size.small};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  &:hover {
    background: ${theme.colors.gray[50]};
    color: ${theme.colors.black};
  }
`;
