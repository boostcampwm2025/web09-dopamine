'use client';

import styled from '@emotion/styled';
import type { Theme } from '@emotion/react';
import React, { useEffect, useMemo, useState } from 'react';
import type { DragItemPayload } from './mockIdea';

type CategorySectionProps = {
  title: string;
  muted?: boolean; // 분류 없음 등 흐린 버전
  droppableId?: string;
  onItemDrop?: (payload: DragItemPayload) => void;
  children?: React.ReactNode;
};

type ThemeColors = {
  surface: string;
  surfaceMuted: string;
  border: string;
  borderMuted: string;
  accent: string;
  accentMuted: string;
  text: string;
  textMuted: string;
};

declare module '@emotion/react' {
  export interface Theme {
    colors?: Partial<ThemeColors>;
  }
}

const color = <K extends keyof ThemeColors>(
  theme: Theme,
  key: K,
  fallback: string,
) => theme?.colors?.[key] ?? fallback;

const StyledCategorySection = styled.section<{ muted?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 11px;
  background: ${({ muted, theme }) =>
    muted
      ? color(theme, 'surfaceMuted', '#fafafa')
      : color(theme, 'surface', '#f0fdf4')};
  border: 2px dashed
    ${({ muted, theme }) =>
      muted
        ? color(theme, 'borderMuted', '#e5e7eb')
        : color(theme, 'border', '#bbf7d0')};
  border-radius: 24px;
  padding: 16px;
  width: 400px;
`;

const Header = styled.header<{ muted?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ muted, theme }) =>
    muted
      ? color(theme, 'textMuted', '#9a9a9a')
      : color(theme, 'text', '#222222')};
  font-weight: 600;
  font-size: 14px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Dot = styled.span<{ muted?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ muted, theme }) =>
    muted
      ? color(theme, 'accentMuted', '#c9c9c9')
      : color(theme, 'accent', '#00a94f')};
`;

const Title = styled.span<{ muted?: boolean }>`
  color: ${({ muted, theme }) =>
    muted
      ? color(theme, 'textMuted', '#9ca3af')
      : color(theme, 'text', '#00a94f')};
`;

const Input = styled.input`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 14px;
  color: #111827;
`;

const EditButton = styled.button<{ muted?: boolean }>`
  display: ${({ muted }) => (muted ? 'none' : 'inline-flex')};
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const ChildrenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export default function CategorySection({
  title,
  muted = false,
  droppableId,
  onItemDrop,
  children,
}: CategorySectionProps) {
  const [curTitle, setCurTitle] = useState<string>(title);
  const [draft, setDraft] = useState<string>(title);
  const [isEditing, setIsEditing] = useState<boolean>(false);   // 제목 수정 중 여부

  useEffect(() => {
    setCurTitle(title);
    setDraft(title);
    setIsEditing(false);
  }, [title]);

  const save = (nextTitle: string) => {
    const value = nextTitle.trim();
    setCurTitle(value || curTitle);
    setDraft(value || curTitle);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(curTitle);
    setIsEditing(false);
  };

  const dropHandlers = useMemo(() => {
    if (!droppableId || !onItemDrop) return {};
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData('application/json');
        if (!raw) return;
        try {
          const payload = JSON.parse(raw) as DragItemPayload;
          onItemDrop(payload);
        } catch {
          /**
           * To Do
           * 페이로드 처리 실패 시 UI 핸들링
           */
        }
      },
    };
  }, [droppableId, onItemDrop]);

  return (
    <StyledCategorySection
      muted={muted}
      aria-label={`${curTitle} 카테고리`}
      {...dropHandlers}
    >
      <Header muted={muted}>
        <HeaderLeft>
          <Dot muted={muted} />
          {isEditing ? (
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => save(draft)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save(draft);
                if (e.key === 'Escape') cancel();
              }}
              autoFocus
            />
          ) : (
            <Title muted={muted}>{curTitle}</Title>
          )}
        </HeaderLeft>
        {!isEditing && (
          <EditButton onClick={() => setIsEditing(true)} muted={muted}>
            수정
          </EditButton>
        )}
      </Header>
      <ChildrenWrapper>{children}</ChildrenWrapper>
    </StyledCategorySection>
  );
}
