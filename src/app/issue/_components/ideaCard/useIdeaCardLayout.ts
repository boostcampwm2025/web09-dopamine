import { CSSProperties } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { useCanvasContext } from '../canvas/CanvasContext';
import type { Position } from '../../types/idea';

interface UseIdeaCardLayoutProps {
  id?: string;
  categoryId?: string | null;
  position?: Position | null;
  onPositionChange?: (id: string, position: Position) => void;
}

interface UseIdeaCardLayoutReturn {
  handleMouseDown?: (e: React.MouseEvent) => void;
  style?: CSSProperties;
}

/**
 * IdeaCard의 레이아웃 로직을 담당하는 Hook
 * - 카테고리에 속한 경우: 드래그 불가, 기본 스타일
 * - 캔버스에 자유 배치된 경우: 드래그 가능, absolute positioning
 */
export function useIdeaCardLayout(props: UseIdeaCardLayoutProps): UseIdeaCardLayoutReturn {
  const { id, categoryId, position, onPositionChange } = props;
  const { scale } = useCanvasContext();

  // 카테고리에 속해 있는지 확인
  const inCategory = !!categoryId;

  // 카테고리에 속하지 않고, position과 핸들러가 있으면 드래그 가능
  const enableDrag = !inCategory && position && id && onPositionChange;

  const draggable = enableDrag
    ? useDraggable({
        initialPosition: position,
        scale,
        onDragEnd: (newPosition) => {
          if (id && onPositionChange) {
            onPositionChange(id, newPosition);
          }
        },
      })
    : null;

  // 드래그 가능한 경우: absolute positioning + 드래그 커서
  if (draggable) {
    return {
      handleMouseDown: draggable.handleMouseDown,
      style: {
        position: 'absolute',
        left: draggable.position.x,
        top: draggable.position.y,
        cursor: draggable.isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: draggable.isDragging ? 1000 : 1,
      },
    };
  }

  // 카테고리 안이거나 드래그 불가능한 경우: 기본 스타일
  return {
    handleMouseDown: undefined,
    style: undefined,
  };
}
