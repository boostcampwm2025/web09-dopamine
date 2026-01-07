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
  overflow-y: auto;
`;

export default function WithSidebarLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // AI 구조화 이벤트 발생
  const handleAIStructure = () => {
    window.dispatchEvent(new CustomEvent('aiStructure'));
  };

  // 경로에 따라 다른 헤더 렌더링
  const renderHeader = () => {
    
    if (pathname?.startsWith('/issue')) {
      return <IssueHeader onAIStructure={handleAIStructure} />;
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
