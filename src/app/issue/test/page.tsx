'use client';

import { useState } from 'react';
import CategoryCard from '../_components/category/categoryCard';
import IdeaCard from '../_components/ideaCard/IdeaCard';
import { CategoryMock, categoryMocks } from './mockCategory';
import { IdeaCardMock, ideaCardMocks } from './mockIdea';

type DragItemPayload = {
  id: string;
  fromColumn: string;
};

type ColumnSection = CategoryMock;
type ColumnMap = Record<string, IdeaCardMock[]>;

const initialSections: ColumnSection[] = categoryMocks;

const buildInitialColumns = (sections: ColumnSection[], ideas: IdeaCardMock[]): ColumnMap => {
  const keys = sections.map((s) => s.key);
  return ideas.reduce((acc, idea, idx) => {
    const key = keys[idx % keys.length];
    const list = acc[key] ?? [];
    acc[key] = [...list, idea];
    return acc;
  }, {} as ColumnMap);
};

const initialData: ColumnMap = buildInitialColumns(initialSections, ideaCardMocks);

function DraggableIdea({ idea, fromColumn }: { idea: IdeaCardMock; fromColumn: string }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData(
          'application/json',
          JSON.stringify({ id: idea.id, fromColumn } as DragItemPayload),
        );
      }}
    >
      <IdeaCard
        content={idea.content}
        author={idea.author}
        isSelected={idea.isSelected}
        isVotePhrase={idea.isVotePhrase}
        agreeCount={idea.agreeCount}
        disagreeCount={idea.disagreeCount}
        needDiscussion={idea.needDiscussion}
        editable={idea.editable}
      />
    </div>
  );
}

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
        <CategoryCard
          key={section.key}
          title={section.title}
          muted={section.muted}
          droppableId={section.key}
          onItemDrop={handleDrop(section.key)}
          onRemove={() => handleRemove(section.key)}
        >
          {(columns[section.key] ?? []).map((idea) => (
            <DraggableIdea
              key={idea.id}
              idea={idea}
              fromColumn={section.key}
            />
          ))}
        </CategoryCard>
      ))}
    </div>
  );
}
