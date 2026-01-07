'use client';

import ConclusionSection from './_components/conclusion/conclusion-section';
import RankingList from './_components/ranking/ranking-list';
import WordCloud from './_components/word-cloud/word-cloud';
import * as S from './page.style';

export default function IssueSummaryPage() {
  return (
    <S.Container>
      <ConclusionSection
        title="선택된 아이디어"
        votes={150}
        candidates={25}
      />
      <S.wordCloudAndVoteBox>
        <S.ComponentBox>
          <WordCloud />
        </S.ComponentBox>
                <S.ComponentBox>
          <WordCloud />
        </S.ComponentBox>
      </S.wordCloudAndVoteBox>
      <RankingList />
    </S.Container>
  );
}
