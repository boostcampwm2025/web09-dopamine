'use client';

import styled from '@emotion/styled';
import RankingList from './_components/ranking-list';
import ConclusionSection from './_components/conclusion-section';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 80px;
  padding: 60px;
  flex: 1;
  height: fit-content;
`;

export default function IssueSummaryPage() {
  return (
    <Container>
      <ConclusionSection
        title="선택된 아이디어"
        votes={150}
        candidates={25}
      />
      <RankingList />
    </Container>
  );
}
