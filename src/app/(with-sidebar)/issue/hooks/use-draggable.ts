'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Position } from '../types/idea';

interface UseDraggableProps {
  initialPosition: Position;
  onDragStart?: () => void;
  onDragEnd?: (position: Position) => void;
  onDrag?: (position: Position, delta: { dx: number; dy: number }) => void;
  checkCollision?: (position: Position) => boolean; 
  disabled?: boolean;
  scale?: number;
}

export const useDraggable = ({
  initialPosition,
  onDragStart,
  onDragEnd,
  onDrag,
  checkCollision,
  disabled = false,
  scale = 1,
}: UseDraggableProps) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false); 
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const elementStartPos = useRef<Position>(initialPosition);
  const lastDelta = useRef({ dx: 0, dy: 0 });

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      e.stopPropagation();
      setIsDragging(true);
      setHasMoved(false); 
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      elementStartPos.current = position;
      lastDelta.current = { dx: 0, dy: 0 };
      onDragStart?.();
    },
    [position, disabled, onDragStart],
  );

  /**
   * 드래그 중 위치 업데이트
   * scale을 반영하여 정확한 위치 계산
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = (e.clientX - dragStartPos.current.x) / scale;
      const deltaY = (e.clientY - dragStartPos.current.y) / scale;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > 5 && !hasMoved) {
        setHasMoved(true);
      }

      const newPosition = {
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY,
      };

      if (checkCollision && checkCollision(newPosition)) {
        const candidateX = { x: newPosition.x, y: position.y };
        const candidateY = { x: position.x, y: newPosition.y };
        const canMoveX = !checkCollision(candidateX);
        const canMoveY = !checkCollision(candidateY);

        if (canMoveX && canMoveY) {
          if (Math.abs(deltaX) >= Math.abs(deltaY)) {
            newPosition.x = candidateX.x;
            newPosition.y = candidateX.y;
          } else {
            newPosition.x = candidateY.x;
            newPosition.y = candidateY.y;
          }
        } else if (canMoveX) {
          newPosition.x = candidateX.x;
          newPosition.y = candidateX.y;
        } else if (canMoveY) {
          newPosition.x = candidateY.x;
          newPosition.y = candidateY.y;
        } else {
          return;
        }
      }

      setPosition(newPosition);

      // 이전 프레임과의 차이만 전달
      const actualDelta = {
        dx: newPosition.x - elementStartPos.current.x,
        dy: newPosition.y - elementStartPos.current.y,
      };
      const incrementalDelta = {
        dx: actualDelta.dx - lastDelta.current.dx,
        dy: actualDelta.dy - lastDelta.current.dy,
      };

      lastDelta.current = actualDelta;
      onDrag?.(newPosition, incrementalDelta);
    },
    [isDragging, scale, hasMoved, onDrag, checkCollision],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.(position);
    }
  }, [isDragging, position, onDragEnd]);

  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    position,
    isDragging,
    hasMoved,
    handleMouseDown,
  };
};
