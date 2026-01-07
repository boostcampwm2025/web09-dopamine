'use client';

import * as S from './page.style';
import RankingList from './_components/ranking-list';
import ConclusionSection from './_components/conclusion-section';

export default function IssueSummaryPage() {
  return (
    <S.Container>
      <ConclusionSection
        title="선택된 아이디어"
        votes={150}
        candidates={25}
      />
      <RankingList />
    </S.Container>
  );
}
