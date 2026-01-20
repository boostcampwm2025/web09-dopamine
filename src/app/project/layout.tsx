'use client';

import { ReactNode } from 'react';
import styled from '@emotion/styled';
import ProjectHeader from '@/app/project/_components/header/project-header';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  height: 100vh;
  padding-top: 32px;
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow-y: auto;
  padding-inline: 144px;
`;

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutContainer>
      <ProjectHeader />
      <ContentArea>{children}</ContentArea>
    </LayoutContainer>
  );
}
