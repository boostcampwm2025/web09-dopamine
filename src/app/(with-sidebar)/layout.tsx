'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import IssueHeader from '@/app/(with-sidebar)/issue/_components/header/header';
import IssueSidebar from '@/app/(with-sidebar)/issue/_components/layout/issue-sidebar';
import ProjectHeader from './project/_components/header/header';

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
    if (pathname?.startsWith('/issue')) {
      return <IssueHeader />;
    }

    if (pathname?.startsWith('/project')) {
      return <ProjectHeader />;
    }

    return null;
  };

  return (
    <LayoutContainer>
      {renderHeader()}
      <BodyContainer>
        <IssueSidebar />
        <ContentArea>{children}</ContentArea>
      </BodyContainer>
    </LayoutContainer>
  );
}
