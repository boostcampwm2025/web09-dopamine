'use client';

import { useState } from 'react';
import useCategory from '@/app/(with-sidebar)/issue/hooks/use-category-card';
import { useDraggable } from '../../hooks/use-draggable';
import type { Position } from '../../types/idea';
import { useCanvasContext } from '../canvas/canvas-context';
import {
  Actions,
  Btn,
  ChildrenWrapper,
  DangerBtn,
  Dot,
  Header,
  HeaderLeft,
  Input,
  StyledCategoryCard,
  Title,
} from './category-card.styles';

interface CategoryCardProps {
  id: string;
  title: string;
  position: Position;
  isMuted?: boolean;
  children?: React.ReactNode;
  onRemove?: () => void;
  onPositionChange?: (id: string, position: Position) => void;
  onDrag?: (id: string, position: Position, delta: { dx: number; dy: number }) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDropIdea?: (ideaId: string) => void;
}

export default function CategoryCard({
  id,
  title,
  position,
  isMuted = false,
  children,
  onRemove,
  onPositionChange,
  onDrag,
  onDragStart,
  onDragEnd,
  onDropIdea,
}: CategoryCardProps) {
  const { scale } = useCanvasContext();
  const [isDragOver, setIsDragOver] = useState(false);

  // 카테고리 드래그 기능
  const draggable = onPositionChange
    ? useDraggable({
        initialPosition: position,
        scale,
        onDragStart: onDragStart,
        onDrag: onDrag
          ? (newPosition, delta) => {
              onDrag(id, newPosition, delta);
            }
          : undefined,
        onDragEnd: (newPosition) => {
          onPositionChange(id, newPosition);
          onDragEnd?.();
        },
      })
    : null;

  const {
    curTitle,
    isEditing,
    setIsEditing,
    draftTitle,
    setDraftTitle,
    submitEditedTitle,
    cancelEditingTitle,
  } = useCategory({ title });

  // 드롭존 이벤트 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // 드롭을 허용하려면 필수
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const ideaId = e.dataTransfer.getData('ideaId');
    if (ideaId && onDropIdea) {
      onDropIdea(ideaId);
    }
  };

  return (
    <StyledCategoryCard
      isMuted={isMuted}
      aria-label={`${curTitle} 카테고리`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={
        draggable
          ? {
              position: 'absolute' as const,
              left: draggable.position.x,
              top: draggable.position.y,
              cursor: draggable.isDragging ? 'grabbing' : 'grab',
              userSelect: 'none' as const,
              zIndex: 0, // 항상 아이디어 카드보다 낮게
              outline: isDragOver ? '2px dashed #4CAF50' : 'none',
              backgroundColor: isDragOver ? 'rgba(76, 175, 80, 0.1)' : undefined,
            }
          : {
              outline: isDragOver ? '2px dashed #4CAF50' : 'none',
              backgroundColor: isDragOver ? 'rgba(76, 175, 80, 0.1)' : undefined,
            }
      }
    >
      <Header
        isMuted={isMuted}
        onMouseDown={draggable?.handleMouseDown}
      >
        <HeaderLeft>
          <Dot isMuted={isMuted} />
          {isEditing ? (
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={() => submitEditedTitle(draftTitle)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitEditedTitle(draftTitle);
                if (e.key === 'Escape') cancelEditingTitle();
              }}
              autoFocus
            />
          ) : (
            <Title isMuted={isMuted}>{curTitle}</Title>
          )}
        </HeaderLeft>
        {!isEditing && (
          <Actions>
            <Btn
              onClick={() => setIsEditing(true)}
              isMuted={isMuted}
            >
              수정
            </Btn>
            {onRemove && (
              <DangerBtn
                onClick={() => onRemove()}
                isMuted={isMuted}
              >
                삭제
              </DangerBtn>
            )}
          </Actions>
        )}
      </Header>
      {children && <ChildrenWrapper>{children}</ChildrenWrapper>}
    </StyledCategoryCard>
  );
}
