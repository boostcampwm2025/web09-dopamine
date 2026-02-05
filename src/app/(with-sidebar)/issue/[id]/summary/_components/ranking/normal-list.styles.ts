import styled from '@emotion/styled';
import { VOTE_TYPE } from '@/constants/issue';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.radius.medium};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
`;

export const Item = styled.div<{ highlighted?: boolean; isTop?: boolean; isSelected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid ${theme.colors.gray[100]};
  background: 'transparent';
  border-radius: ${({ isTop }) =>
    isTop ? theme.radius.medium + ' ' + theme.radius.medium + ' 0 0' : '0'};

  &first-of-type {
    border-top-left-radius: ${theme.radius.medium};

  &:last-of-type {
    border-bottom: none;
        border-top-left-radius: ${theme.radius.medium};

  }
`;

export const ItemLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

export const ItemRight = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
`;

export const RankBadge = styled.div<{ highlighted?: boolean; isSelected?: boolean }>`
  min-width: 32px;
  height: 32px;
  border-radius: ${theme.radius.medium};
  display: grid;
  place-items: center;
  font-weight: 600;
  font-size: ${theme.font.size.medium};
  color: ${({ highlighted }) => (highlighted ? theme.colors.white : theme.colors.gray[400])};
  background: ${({ highlighted }) =>
    highlighted ? theme.colors.green[600] : theme.colors.gray[100]};
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const ContentWrapper = styled.div`
  display: flex;
  gap: 8px;
  justify-items: center;
`;

export const SelectLabel = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1px 6px;
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.semibold};
  line-height: 1;
  color: ${theme.colors.yellow[500]};
  background-color: ${theme.colors.yellow[100]};
  border: 1px solid ${theme.colors.yellow[500]};
  border-radius: ${theme.radius.large};
`;

export const Title = styled.div`
  font-size: ${theme.font.size.medium};
  font-weight: 500;
  color: ${theme.colors.black};
  letter-spacing: 0;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${theme.colors.gray[400]};
  font-size: ${theme.font.size.small};
  font-weight: 400;
  letter-spacing: 0;
  line-height: 16px;
`;

export const Author = styled.span`
  flex-wrap: wrap;
`;

export const Divider = styled.span`
  width: 4px;
  height: 4px;
  background: ${theme.colors.gray[300]};
  border-radius: ${theme.radius.half};
`;

export const VoteInfoSection = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const VoteInfo = styled.div<{
  type?: typeof VOTE_TYPE.AGREE | typeof VOTE_TYPE.DISAGREE;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: ${theme.radius.medium};
  background-color: ${({ type }) =>
    type === VOTE_TYPE.AGREE ? theme.colors.green[50] : theme.colors.red[50]};
`;

export const VoteLabel = styled.span`
  font-size: ${theme.font.size.small};
  font-weight: 400;
  color: ${theme.colors.gray[600]};
  letter-spacing: 0;
`;

export const VoteCount = styled.span<{
  type?: typeof VOTE_TYPE.AGREE | typeof VOTE_TYPE.DISAGREE;
}>`
  font-size: ${theme.font.size.medium};
  font-weight: 600;
  color: ${({ type }) =>
    type === VOTE_TYPE.AGREE ? theme.colors.green[600] : theme.colors.red[600]};
  letter-spacing: 0;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px 0;
  border-radius: 0 0 ${theme.radius.medium} ${theme.radius.medium};
  border-top: 1px solid ${theme.colors.gray[100]};
  background: ${theme.colors.white};
`;

export const MoreButton = styled.button`
  padding: 8px 12px;
  background: ${theme.colors.white};
  color: ${theme.colors.gray[500]};
  font-size: ${theme.font.size.small};
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  &:hover {
    background: ${theme.colors.gray[50]};
    color: ${theme.colors.black};
  }
`;
