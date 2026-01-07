'use client';

import { useState } from 'react';
import Image from 'next/image';
import CategorizedListClient from './categorized-list';
import {
  Card,
  BtnContainer,
  Btn,
  HeaderLeft,
  Header,
  HeaderTitle,
} from './ranking-list.styles';
import NormalList from './normal-list';

export default function RankingList() {
  const [isCategorized, setIsCategorized] = useState(false);

  return (
    <Card>
      <Header>
        <HeaderLeft>
          <Image
            src="/trophy.svg"
            alt="트로피 아이콘"
            width={20}
            height={20}
          />
          <HeaderTitle>투표 결과 순위</HeaderTitle>
        </HeaderLeft>
        <BtnContainer>
          <Btn selected={!isCategorized} onClick={() => setIsCategorized(false)}>
            전체 순위
          </Btn>
          <Btn selected={isCategorized} onClick={() => setIsCategorized(true)}>
            카테고리별
          </Btn>
        </BtnContainer>
      </Header>
      {isCategorized ? (
        <CategorizedListClient />
      ) : (
        <NormalList />
      )}
    </Card>
  );
}
