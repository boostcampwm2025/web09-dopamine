'use client';

import styled from '@emotion/styled';
import { boxStyle } from '@/styles/mixins';
import { theme } from '@/styles/theme';

export const ProjectPageContainer = styled.div`
  background-color: ${theme.colors.gray[50]};
  width: 100%;
  overflow-y: auto;
  padding-top: 28px;
  padding-left: 100px;
  padding-right: 100px;
  display: flex;
  flex-direction: column;
  gap: 36px;
`;

export const ProjectTitleBox = styled.div`
  ${boxStyle}
  position: relative;
  font-size: ${theme.font.size.xl};
  font-weight: ${theme.font.weight.bold};
  padding: 36px 24px;
`;

export const EditIconWrapper = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`;

export const DescContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ProjectDescBox = styled.div`
  ${boxStyle}
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  width: 60%;
  height: 230px;
`;

export const ProjectDescText = styled.div`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.medium};
  color: ${theme.colors.gray[800]};
  line-height: 2;
`;

export const MemberBox = styled.div`
  width: 40%;
  ${boxStyle}
  padding: 20px;
`;

export const ProjectInfoContainer = styled.div`
  display: flex;
  gap: 20px;
`;

export const TopicSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-block: 32px;
`;

export const TopicListContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TopicListHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const TopicListTitle = styled.h1`
  font-size: 24px;
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.gray[900]};
  margin: 0;
`;

export const TopicListDescription = styled.span`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.medium};
  color: ${theme.colors.gray[600]};
`;

export const TopicCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
