import CategorySection from '../_component/categorySection';

export default function Page() {
  return (
    <div style={{ display: 'flex', gap: 24, padding: 32, backgroundColor: 'white' }}>
      <CategorySection title="커뮤니티 바이럴" />
      <CategorySection title="분류 없음" muted />
    </div>
  );
}
