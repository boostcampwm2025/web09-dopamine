'use client';

import styled from '@emotion/styled';

export type Idea = {
  id: string;
  title: string;
  author?: string;
};

export type DragItemPayload = {
  id: string;
  fromColumn: string;
};

type MockIdeaProps = {
  idea: Idea;
  fromColumn: string;
};

const Card = styled.div`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  font-size: 14px;
  cursor: grab;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const Author = styled.div`
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
`;

export default function MockIdea({ idea, fromColumn }: MockIdeaProps) {
  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData(
          'application/json',
          JSON.stringify({ id: idea.id, fromColumn } as DragItemPayload),
        );
      }}
    >
      <div>{idea.title}</div>
      {idea.author && <Author>{idea.author}</Author>}
    </Card>
  );
}
