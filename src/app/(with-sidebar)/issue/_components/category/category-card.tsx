'use client';

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
      isMuted={isMuted}
      aria-label={`${curTitle} 카테고리`}
      onMouseDown={draggable?.handleMouseDown}
      style={
        draggable
          ? {
              position: 'absolute' as const,
              left: draggable.position.x,
              top: draggable.position.y,
              cursor: draggable.isDragging ? 'grabbing' : 'grab',
              userSelect: 'none' as const,
              zIndex: 0, // 항상 아이디어 카드보다 낮게
            }
          : {}
      }
    >
      <Header isMuted={isMuted}>
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