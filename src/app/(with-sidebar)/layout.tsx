'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import IssueHeader from '@/app/(with-sidebar)/issue/_components/header/header';
import IssueSidebar from '@/app/(with-sidebar)/issue/_components/layout/issue-sidebar';
import TopicHeader from '@/app/(with-sidebar)/topic/_components/header/topic-header';
import TopicSidebar from '@/app/(with-sidebar)/topic/_components/topic-sidebar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const BodyContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow-y: auto;
`;

export default function WithSidebarLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const renderHeader = () => {
    if (pathname?.startsWith('/topic')) {
      return <TopicHeader />;
    }

    if (pathname?.startsWith('/issue')) {
      return <IssueHeader />;
    }

    return null;
  };

  const renderSidebar = () => {
    if (pathname?.startsWith('/topic')) {
      return <TopicSidebar />;
    }

    if (pathname?.startsWith('/issue')) {
      return <IssueSidebar />;
    }

    return null;
  };

  return (
    <LayoutContainer>
      {renderHeader()}
      <BodyContainer>
        {renderSidebar()}
        <ContentArea>{children}</ContentArea>
      </BodyContainer>
    </LayoutContainer>
  );
}
