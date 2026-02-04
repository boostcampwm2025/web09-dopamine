'use client';

import { ReactNode, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import IssueHeader from '@/app/(with-sidebar)/issue/_components/header/header';
import IssueSidebar from '@/app/(with-sidebar)/issue/_components/layout/issue-sidebar';
import TopicHeader from '@/app/(with-sidebar)/topic/_components/header/topic-header';
import {
  SIDEBAR_TOGGLE_BORDER_RADIUS,
  SIDEBAR_TOGGLE_HEIGHT,
  SIDEBAR_TOGGLE_WIDTH,
  SIDEBAR_WIDTH,
} from '@/constants/sidebar';
import { theme } from '@/styles/theme';
import TopicSidebar from '@/app/(with-sidebar)/topic/_components/layout/topic-sidebar';
import ProjectHeader from '../project/_components/header/header';
import ProjectSidebar from '../project/_components/sidebar/project-sidebar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const BodyContainer = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const SidebarWrapper = styled.div<{ $isOpen: boolean }>`
  flex-shrink: 0;
  width: ${({ $isOpen }) => ($isOpen ? `${SIDEBAR_WIDTH}px` : `0px`)};
  height: 100%;
  overflow: hidden;
  background-color: transparent;
  transition: width 0.2s ease;
`;

const SidebarToggle = styled.button<{ $isOpen: boolean }>`
  position: absolute;
  top: 50%;
  left: ${({ $isOpen }) => ($isOpen ? `${SIDEBAR_WIDTH}px` : `0px`)};
  transform: translateY(-50%);

  display: flex;
  align-items: center;
  justify-content: center;

  width: ${SIDEBAR_TOGGLE_WIDTH}px;
  height: ${SIDEBAR_TOGGLE_HEIGHT}px;

  padding: 0;
  border: none;
  border-radius: 0 ${SIDEBAR_TOGGLE_BORDER_RADIUS}px ${SIDEBAR_TOGGLE_BORDER_RADIUS}px 0;

  background-color: ${theme.colors.gray[100]};
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  z-index: 10;

  border-left: 1px solid ${theme.colors.gray[300]};
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.06);

  transition: left 0.2s ease;

  &:hover {
    background-color: ${theme.colors.gray[200]};
    color: ${theme.colors.gray[600]};
  }
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
`;

/* ================= component ================= */

export default function WithSidebarClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        {sidebar ? (
          <>
            <SidebarWrapper $isOpen={isSidebarOpen}>{sidebar}</SidebarWrapper>
            <SidebarToggle
              type="button"
              aria-label={isSidebarOpen ? '사이드바 접기' : '사이드바 펼치기'}
              $isOpen={isSidebarOpen}
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              {isSidebarOpen ? (
                <Image
                  src="/chevron-left.svg"
                  alt=""
                  width={6}
                  height={10}
                  aria-hidden
                />
              ) : (
                <Image
                  src="/chevron-right.svg"
                  alt=""
                  width={6}
                  height={10}
                  aria-hidden
                />
              )}
            </SidebarToggle>
          </>
        ) : null}

        <ContentArea>{children}</ContentArea>
      </BodyContainer>
    </LayoutContainer>
  );
}
