import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '../../hooks';
import type { Position } from '../../types/idea';

interface UseCategoryDndOptions {
  id: string;
  position: Position;
  scale: number;
  onPositionChange?: (id: string, position: Position) => void;
  onDrag?: (id: string, position: Position, delta: { dx: number; dy: number }) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  checkCollision?: (id: string, position: Position) => boolean;
}

export function useCategoryDnd({
  id,
  position,
  scale,
  onPositionChange,
  onDrag,
  onDragStart,
  onDragEnd,
  checkCollision,
}: UseCategoryDndOptions) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id,
    data: { type: 'category', categoryId: id },
  });

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

  const dndCardStyle = draggable
    ? {
        position: 'absolute' as const,
        left: draggable.position.x,
        top: draggable.position.y,
        cursor: draggable.isDragging ? 'grabbing' : 'grab',
        userSelect: 'none' as const,
        zIndex: 0,
        outline: isOver ? '2px dashed #4CAF50' : 'none',
        backgroundColor: isOver ? 'rgba(76, 175, 80, 0.1)' : undefined,
        transition: draggable.isDragging ? 'none' : 'left 0.4s ease-out, top 0.4s ease-out',
      }
    : {
        outline: isOver ? '2px dashed #4CAF50' : 'none',
        backgroundColor: isOver ? 'rgba(76, 175, 80, 0.1)' : undefined,
      };

  return {
    setDroppableRef,
    dndCardStyle,
    draggable,
  };
}
