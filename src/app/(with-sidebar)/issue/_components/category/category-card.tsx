'use client';

import { useDroppable } from '@dnd-kit/core';
import useCategory from '@/app/(with-sidebar)/issue/hooks/use-category-card';
import { useCategoryStore } from '@/app/(with-sidebar)/issue/store/use-category-store';
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
  issueId?: string;
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
  checkCollision?: (id: string, position: Position) => boolean;
}

export default function CategoryCard({
  id,
  issueId = 'default',
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
  checkCollision,
}: CategoryCardProps) {
  const { scale } = useCanvasContext();
  const { updateCategoryTitle } = useCategoryStore(issueId);

  // dnd-kit useDroppable
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id,
  });

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
        checkCollision: checkCollision
          ? (newPosition) => checkCollision(id, newPosition)
          : undefined,
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
  } = useCategory({ 
    title,
    onTitleChange: (newTitle: string) => {
      updateCategoryTitle(id, newTitle);
    },
  });

  return (
    <StyledCategoryCard
      ref={setDroppableRef}
      data-category-id={id}
      isMuted={isMuted}
      aria-label={`${curTitle} 카테고리`}
      style={
        draggable
          ? {
              position: 'absolute' as const,
              left: draggable.position.x,
              top: draggable.position.y,
              cursor: draggable.isDragging ? 'grabbing' : 'grab',
              userSelect: 'none' as const,
              zIndex: 0, // 항상 아이디어 카드보다 낮게
              outline: isOver ? '2px dashed #4CAF50' : 'none',
              backgroundColor: isOver ? 'rgba(76, 175, 80, 0.1)' : undefined,
            }
          : {
              outline: isOver ? '2px dashed #4CAF50' : 'none',
              backgroundColor: isOver ? 'rgba(76, 175, 80, 0.1)' : undefined,
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
