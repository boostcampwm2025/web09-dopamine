'use client';

import { theme } from '@/styles/theme';
import type { Position } from '../../types/idea';
import { useCanvasContext } from '../canvas/canvas-context';
import CategoryCardHeader from './category-card-header';
import { ChildrenWrapper, StyledCategoryCard } from './category-card.styles';
import { useCategoryCard } from './use-category-card';
import { useCategoryDnd } from './use-category-dnd';

interface CategoryCardProps {
  id: string;
  issueId: string;
  title: string;
  position: Position;
  isMuted?: boolean;
  children?: React.ReactNode;
  hasActiveComment?: boolean;
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
  issueId,
  title,
  position,
  isMuted = false,
  children,
  hasActiveComment = false,
  onRemove,
  onPositionChange,
  onDrag,
  onDragStart,
  onDragEnd,
  checkCollision,
}: CategoryCardProps) {
  const { scale } = useCanvasContext();

  const { setDroppableRef, dndCardStyle, draggable } = useCategoryDnd({
    id,
    position,
    scale,
    onPositionChange,
    onDrag,
    onDragStart,
    onDragEnd,
    checkCollision,
  });

  const {
    curTitle,
    isEditing,
    setIsEditing,
    draftTitle,
    setDraftTitle,
    submitEditedTitle,
    cancelEditingTitle,
    handlePointerDown,
    handleClick,
  } = useCategoryCard({
    id,
    issueId,
    title,
  });

  const cardStyle = {
    ...dndCardStyle,
    zIndex: hasActiveComment ? theme.zIndex.important : (dndCardStyle.zIndex ?? 0),
  };

  return (
    <StyledCategoryCard
      ref={setDroppableRef}
      data-category-id={id}
      isMuted={isMuted}
      aria-label={`${curTitle} 카테고리`}
      style={cardStyle}
    >
      <CategoryCardHeader
        curTitle={curTitle}
        draftTitle={draftTitle}
        isEditing={isEditing}
        isMuted={isMuted}
        onStartEdit={() => setIsEditing(true)}
        onChangeTitle={setDraftTitle}
        onSubmitTitle={submitEditedTitle}
        onCancelEdit={cancelEditingTitle}
        onRemove={onRemove}
        onMouseDown={(e) => {
          draggable?.handleMouseDown(e);
          handlePointerDown(e);
        }}
        onClick={handleClick}
      />
      {children && <ChildrenWrapper>{children}</ChildrenWrapper>}
    </StyledCategoryCard>
  );
}
