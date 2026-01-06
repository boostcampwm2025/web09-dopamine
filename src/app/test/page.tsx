import RankingList from "../(with-sidebar)/issue/_components/summary/ranking-list";

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
      <RankingList/>
    </main>
  );
}
