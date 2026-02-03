'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import IssueHeader from '@/app/(with-sidebar)/issue/_components/header/header';
import IssueSidebar from '@/app/(with-sidebar)/issue/_components/layout/issue-sidebar';
import TopicHeader from '@/app/(with-sidebar)/topic/_components/header/topic-header';
import ProjectHeader from '../project/_components/header/header';
import ProjectSidebar from '../project/_components/sidebar/project-sidebar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const BodyContainer = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

/** 사이드바 + (이슈 페이지 시) 오른쪽 토글을 담는 영역 */
const SidebarWrapper = styled.div<{ $showToggle?: boolean }>`
  position: relative;
  flex-shrink: 0;
  width: ${({ $showToggle }) => ($showToggle ? '268px' : '256px')}; /* 256(sidebar) + 12(toggle) when visible */
  height: 100%;
`;

const SidebarToggle = styled.button`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: 0 4px 4px 0;
  background-color: ${theme.colors.gray[100]};
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  z-index: 10;
  border-left: 1px solid ${theme.colors.gray[300]};
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.06);

  &:hover {
    background-color: ${theme.colors.gray[200]};
    color: ${theme.colors.gray[600]};
  }
`;

const ChevronLeft = () => (
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M5 1L1 5L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
`;

export default function WithSidebarClient({ children }: { children: ReactNode }) {
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
        sidebar: <IssueSidebar />,
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
        {sidebar ? (
          <SidebarWrapper $showToggle={pathname?.startsWith('/issue')}>
            {sidebar}
            {pathname?.startsWith('/issue') && (
              <SidebarToggle type="button" aria-label="사이드바 접기/펼치기">
                <ChevronLeft />
              </SidebarToggle>
            )}
          </SidebarWrapper>
        ) : null}
        <ContentArea>{children}</ContentArea>
      </BodyContainer>
    </LayoutContainer>
  );
}
