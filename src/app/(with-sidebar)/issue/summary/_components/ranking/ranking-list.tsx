'use client';

import { useState } from 'react';
import Image from 'next/image';
import CategorizedListClient from './categorized-list';
import * as S from './ranking-list.styles';
import * as PS from '../../page.style';

import NormalList from './normal-list';

export default function RankingList() {
  const [isCategorized, setIsCategorized] = useState(false);

  return (
    <S.Card>
      <S.Header>
        <S.HeaderLeft>
          <Image
            src="/trophy.svg"
            alt="트로피 아이콘"
            width={20}
            height={20}
          />
          <PS.HeaderTitle>투표 결과 순위</PS.HeaderTitle>
        </S.HeaderLeft>
        <S.BtnContainer>
          <S.Btn selected={!isCategorized} onClick={() => setIsCategorized(false)}>
            전체 순위
          </S.Btn>
          <S.Btn selected={isCategorized} onClick={() => setIsCategorized(true)}>
            카테고리별
          </S.Btn>
        </S.BtnContainer>
      </S.Header>
      <PS.ComponentBox>
      {isCategorized ? (
        <CategorizedListClient />
      ) : (
        <NormalList />
      )}
      </PS.ComponentBox>
    </S.Card>
  );
}
