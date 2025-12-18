'use client';

import { ReactNode } from 'react';
import styled from '@emotion/styled';
import SideBar from './Sidebar';

interface TopicIssueLayoutProps {
  children: ReactNode;
  header: ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const BodyContainer = styled.div`
  display: flex;
`;

const TopicIssueLayout = ({ children, header }: TopicIssueLayoutProps) => {
  return (
    <LayoutContainer>
      {header}
      <BodyContainer>
        <SideBar />
        {children}
      </BodyContainer>
    </LayoutContainer>
  );
};

export default TopicIssueLayout;
