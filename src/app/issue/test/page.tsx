'use client';

import { useMemo, useState } from 'react';
import CategorySection from '../_component/categorySection';
import MockIdea, { Idea, DragItemPayload } from '../_component/mockIdea';

type ColumnKey = 'withCategory' | 'noCategory' | 'withCategory2';

const initialData: Record<ColumnKey, Idea[]> = {
  withCategory: [
    { id: '1', title: '커뮤니티에 기술 블로그로 홍보글 작성', author: 'John' },
    { id: '2', title: '에브리타임 대학생 홍보 게시판 활용', author: 'Sarah' },
  ],
  noCategory: [
    { id: '3', title: '인스타 인플루언서에게 협찬 문의 DM 발송', author: 'Mike' },
  ],
  withCategory2: [],
};

export default function Page() {
  const [columns, setColumns] = useState(initialData);

  const handleDrop = (target: ColumnKey) => (payload: DragItemPayload) => {
    const { id, fromColumn } = payload;
    if (fromColumn === target) return;

    setColumns((prev) => {
      if (!(fromColumn in prev)) return prev;
      const sourceKey = fromColumn as ColumnKey;
      const sourceList = [...prev[sourceKey]];
      const idx = sourceList.findIndex((item) => item.id === id);
      if (idx === -1) return prev;
      const [moved] = sourceList.splice(idx, 1);
      const targetList = [...prev[target], moved];
      return { ...prev, [sourceKey]: sourceList, [target]: targetList };
    });
  };

  const sections = useMemo(
    () => [
      {
        key: 'withCategory' as ColumnKey,
        title: '커뮤니티 바이럴',
        muted: false,
      },
      {
        key: 'withCategory2' as ColumnKey,
        title: '무과금 홍보',
        muted: false,
      },
      {
        key: 'noCategory' as ColumnKey,
        title: '분류 없음',
        muted: true,
      },
    ],
    [],
  );

  return (
    <div style={{ display: 'flex', gap: 24, padding: 32, backgroundColor: 'white' }}>
      {sections.map((section) => (
        <CategorySection
          key={section.key}
          title={section.title}
          muted={section.muted}
          droppableId={section.key}
          onItemDrop={handleDrop(section.key)}
        >
          {columns[section.key].map((idea) => (
            <MockIdea key={idea.id} idea={idea} fromColumn={section.key} />
          ))}
        </CategorySection>
      ))}
    </div>
  );
}
