import ConclusionSection from '@/app/(with-sidebar)/issue/_components/summary/conclusion-section';
import RankingList from '@/app/(with-sidebar)/issue/_components/summary/ranking-list';

export default function TestPage() {
  return (
    <main
      style={{
        margin: '0 auto',
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <ConclusionSection
        badgeText="Selected Idea"
        title="OKKY 개발자 커뮤니티에 기술 블로그 형식으로 홍보글 작성"
        votes={12}
        candidates={12}
      />
      <RankingList/>
    </main>
  );
}
