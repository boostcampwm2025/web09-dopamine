'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import IssueHeader from '@/app/(with-sidebar)/issue/_components/header/header';
import IssueSidebar from '@/app/(with-sidebar)/issue/_components/layout/issue-sidebar';

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
  overflow: hidden;
`;

export default function WithSidebarLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const handleAddCategory = () => {
    window.dispatchEvent(new CustomEvent('addCategory'));
  };

  const renderHeader = () => {
    if (pathname?.startsWith('/issue')) {
      return <IssueHeader onAddCategory={handleAddCategory} />;
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
