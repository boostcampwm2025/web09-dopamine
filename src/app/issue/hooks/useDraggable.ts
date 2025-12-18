'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Position } from '../types/idea';

interface UseDraggableProps {
  initialPosition: Position;
  onDragEnd?: (position: Position) => void;
  onDrag?: (position: Position, delta: { dx: number; dy: number }) => void; // 드래그 중 실시간 업데이트
  disabled?: boolean;
  scale?: number; // 캔버스 확대/축소 비율
}

export const useDraggable = ({
  initialPosition,
  onDragEnd,
  onDrag,
  disabled = false,
  scale = 1,
}: UseDraggableProps) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const elementStartPos = useRef<Position>(initialPosition);

  // 외부에서 position이 변경되면 동기화
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  /**
   * 드래그 시작
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      e.stopPropagation(); // 캔버스 패닝 방지
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      elementStartPos.current = position;
    },
    [position, disabled]
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

      const newPosition = {
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY,
      };

      setPosition(newPosition);
      
      // 실시간 delta 전달 (카테고리 드래그 시 내부 아이디어도 함께 이동)
      onDrag?.(newPosition, { dx: deltaX, dy: deltaY });
    },
    [isDragging, scale, onDrag]
  );

  /**
   * 드래그 종료
   */
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.(position);
    }
  }, [isDragging, position, onDragEnd]);

  // 전역 마우스 이벤트 리스너 등록
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
    handleMouseDown,
  };
};
