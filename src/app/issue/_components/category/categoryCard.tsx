'use client';

import type { DragItemPayload } from '../ideaCard/IdeaCard';
import type { Position } from '../../types/idea';
import { useDraggable } from '../../hooks/useDraggable';
import { useCanvasContext } from '../canvas/CanvasContext';
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
} from './categoryCard.style';
import useCategory from './useCategoryCard';

interface CategoryCardProps {
  id: string;
  title: string;
  position: Position;
  muted?: boolean;
  droppableId?: string;
  onItemDrop: (payload: DragItemPayload) => void;
  children: React.ReactNode;
  onRemove?: () => void;
  onPositionChange?: (id: string, position: Position) => void;
}

export default function CategoryCard({
  id,
  title,
  position,
  muted = false,
  droppableId,
  onItemDrop,
  children,
  onRemove,
  onPositionChange,
}: CategoryCardProps) {
  const { scale } = useCanvasContext();

  // 카테고리 드래그 기능
  const draggable = onPositionChange
    ? useDraggable({
        initialPosition: position,
        scale,
        onDragEnd: (newPosition) => {
          onPositionChange(id, newPosition);
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
    dropHandlers,
  } = useCategory({ title, droppableId, onItemDrop });

  return (
    <StyledCategoryCard
      muted={muted}
      aria-label={`${curTitle} 카테고리`}
      onMouseDown={draggable?.handleMouseDown}
      style={draggable ? {
        position: 'absolute',
        left: draggable.position.x,
        top: draggable.position.y,
        cursor: draggable.isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: draggable.isDragging ? 1000 : 1,
      } : undefined}
      {...dropHandlers}
    >
      <Header muted={muted}>
        <HeaderLeft>
          <Dot muted={muted} />
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
            <Title muted={muted}>{curTitle}</Title>
          )}
        </HeaderLeft>
        {!isEditing && (
          <Actions>
            <Btn
              onClick={() => setIsEditing(true)}
              muted={muted}
            >
              수정
            </Btn>
            {onRemove && (
              <DangerBtn
                onClick={() => onRemove()}
                muted={muted}
              >
                삭제
              </DangerBtn>
            )}
          </Actions>
        )}
      </Header>
      <ChildrenWrapper>{children}</ChildrenWrapper>
    </StyledCategoryCard>
  );
}
