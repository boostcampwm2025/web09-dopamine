'use client';

import RankingList from './ranking-list';

export default function IssueSummaryPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
        이슈 결과 요약
      </h1>
      <RankingList />
    </div>
  );
}
