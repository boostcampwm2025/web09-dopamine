import CategorizedList from "../(with-sidebar)/issue/_components/summary/categorized-list";

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
      <CategorizedList/>
    </main>
  );
}
