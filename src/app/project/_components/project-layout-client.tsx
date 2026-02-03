'use client';

import { ReactNode } from 'react';
import styled from '@emotion/styled';
import ProjectHeader from '@/app/project/_components/header/project-header';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  height: 100vh;
  padding: 32px 80px 0 80px;
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow-y: auto;
  max-width: 1200px;
  align-self: center;
  align-items: space-between;
  width: 100%;
`;

export default function ProjectLayoutClient({ children }: { children: ReactNode }) {
  return (
    <LayoutContainer>
      <ProjectHeader />
      <ContentArea>{children}</ContentArea>
    </LayoutContainer>
  );
}
