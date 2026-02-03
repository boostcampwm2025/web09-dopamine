'use client';

import { ReactNode } from 'react';
import styled from '@emotion/styled';
import MypageHeader from '@/app/mypage/_components/header/mypage-header';
import { theme } from '@/styles/theme';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${theme.colors.gray[50]};
`;

const BodyContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

export default function MypageLayoutClient({ children }: { children: ReactNode }) {
  return (
    <LayoutContainer>
      <MypageHeader />
      <BodyContainer>{children}</BodyContainer>
    </LayoutContainer>
  );
}
