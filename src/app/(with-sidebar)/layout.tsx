'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import IssueHeader from '@/app/(with-sidebar)/issue/_components/header/header';
import IssueSidebar from '@/app/(with-sidebar)/issue/_components/layout/issue-sidebar';
import TopicHeader from '@/app/(with-sidebar)/topic/_components/header/topic-header';
import TopicSidebar from '@/app/(with-sidebar)/topic/_components/topic-sidebar';
import ProjectHeader from './project/_components/header/header';
import ProjectSidebar from './project/_components/sidebar/project-sidebar';

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

  const getLayout = () => {
    if (pathname?.startsWith('/issue')) {
      return {
        header: <IssueHeader />,
        sidebar: <IssueSidebar />,
      };
    }

    if (pathname?.startsWith('/topic')) {
      return {
        header: <TopicHeader />,
        sidebar: <TopicSidebar />,
      };
    }

    if (pathname?.startsWith('/project')) {
      return {
        header: <ProjectHeader />,
        sidebar: <ProjectSidebar />,
      };
    }

    return {
      header: null,
      sidebar: null,
    };
  };

  const { header, sidebar } = getLayout();

  return (
    <LayoutContainer>
      {header}
      <BodyContainer>
        {sidebar}
        <ContentArea>{children}</ContentArea>
      </BodyContainer>
    </LayoutContainer>
  );
}
