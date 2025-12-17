'use client';

import { useState } from 'react';
import CategorySection from '../_component/categorySection';
import MockIdea, { Idea, DragItemPayload } from '../_component/mockIdea';

type ColumnSection = {
  key: string;
  title: string;
  muted?: boolean;
};

type ColumnMap = Record<string, Idea[]>;

const initialSections: ColumnSection[] = [
  { key: 'withCategory', title: '커뮤니티 바이럴' },
  { key: 'withCategory2', title: '무과금 홍보' },
  { key: 'noCategory', title: '분류 없음', muted: true },
];

const initialData: ColumnMap = {
  withCategory: [
    { id: '1', title: '커뮤니티에 기술 블로그로 홍보글 작성', author: 'John' },
    { id: '2', title: '에브리타임 대학생 홍보 게시판 활용', author: 'Sarah' },
  ],
  withCategory2: [],
  noCategory: [{ id: '3', title: '인스타 인플루언서에게 협찬 문의 DM 발송', author: 'Mike' }],
};

export default function Page() {
  const [sections, setSections] = useState<ColumnSection[]>(initialSections);
  const [columns, setColumns] = useState<ColumnMap>(initialData);

  const handleDrop = (target: string) => (payload: DragItemPayload) => {
    const { id, fromColumn } = payload;
    if (fromColumn === target) return;

    setColumns((prev) => {
      if (!prev[fromColumn] || !prev[target]) return prev;
      const sourceList = [...prev[fromColumn]];
      const idx = sourceList.findIndex((item) => item.id === id);
      if (idx === -1) return prev;
      const [moved] = sourceList.splice(idx, 1);
      const targetList = [...prev[target], moved];
      return { ...prev, [fromColumn]: sourceList, [target]: targetList };
    });
  };

  const handleRemove = (target: string) => {
    setSections((prev) => prev.filter((s) => s.key !== target));
    setColumns((prev) => {
      const { [target]: _removed, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div style={{ display: 'flex', gap: 24, padding: 32, backgroundColor: 'white' }}>
      {sections.map((section) => (
        <CategorySection
          key={section.key}
          title={section.title}
          muted={section.muted}
          droppableId={section.key}
          onItemDrop={handleDrop(section.key)}
          onRemove={() => handleRemove(section.key)}
        >
          {(columns[section.key] ?? []).map((idea) => (
            <MockIdea key={idea.id} idea={idea} fromColumn={section.key} />
          ))}
        </CategorySection>
      ))}
    </div>
  );
}
