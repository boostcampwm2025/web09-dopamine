'use client';

import type { Position } from '../../types/idea';
import { useDraggable } from '../../hooks/useDraggable';
import { useCanvasContext } from '../canvas/CanvasContext';
import {
  Actions,
  Btn,
  DangerBtn,
  Dot,
  Header,
  HeaderLeft,
  Input,
  StyledCategoryCard,
  Title,
} from './categoryCard.style';
import useCategory from './useCategoryCard';

interface CategoryCardProps {
  id: string;
  title: string;
  position: Position;
  width?: number;
  height?: number;
  muted?: boolean;
  onRemove?: () => void;
  onPositionChange?: (id: string, position: Position) => void;
  onDrag?: (id: string, position: Position, delta: { dx: number; dy: number }) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export default function CategoryCard({
  id,
  title,
  position,
  width = 650,
  height = 400,
  muted = false,
  onRemove,
  onPositionChange,
  onDrag,
  onDragStart,
  onDragEnd,
}: CategoryCardProps) {
  const { scale } = useCanvasContext();

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

  return (
    <StyledCategoryCard
      $muted={muted}
      aria-label={`${curTitle} 카테고리`}
      onMouseDown={draggable?.handleMouseDown}
      style={draggable ? {
        position: 'absolute',
        left: draggable.position.x,
        top: draggable.position.y,
        width,
        height,
        cursor: draggable.isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: 0, // 항상 아이디어 카드보다 낮게
      } : {
        width,
        height,
      }}
    >
      <Header $muted={muted}>
        <HeaderLeft>
          <Dot $muted={muted} />
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
            <Title $muted={muted}>{curTitle}</Title>
          )}
        </HeaderLeft>
        {!isEditing && (
          <Actions>
            <Btn
              onClick={() => setIsEditing(true)}
              $muted={muted}
            >
              수정
            </Btn>
            {onRemove && (
              <DangerBtn
                onClick={() => onRemove()}
                $muted={muted}
              >
                삭제
              </DangerBtn>
            )}
          </Actions>
        )}
      </Header>
    </StyledCategoryCard>
  );
}
