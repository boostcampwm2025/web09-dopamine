'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDraggableWindowOptions {
  initialPosition?: { x: number; y: number };
  draggable?: boolean;
}

export function useDraggableWindow({
  initialPosition,
  draggable = true,
}: UseDraggableWindowOptions) {
  const defaultPositionRef = useRef({ x: 120, y: 120 });
  const resolvedInitialPosition = initialPosition ?? defaultPositionRef.current;
  
  // 윈도우의 현재 좌표 상태
  const [position, setPosition] = useState(resolvedInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  
  // 리렌더링과 무관하게 드래그 시작 시점의 정보를 저장하는 변수들
  const dragStart = useRef({ x: 0, y: 0 });
  const elementStart = useRef(resolvedInitialPosition);

  // 외부에서 초기 위치 값이 바뀌면 상태 업데이트
  useEffect(() => {
    if (!initialPosition) return;

    setPosition(initialPosition);
    elementStart.current = initialPosition;
  }, [initialPosition?.x, initialPosition?.y]);

  /**
   * 1. 드래그 시작 핸들러: 클릭 시점의 마우스 좌표와 요소 좌표를 기록
   */
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!draggable) return;

      event.preventDefault();
      event.stopPropagation();
      
      setIsDragging(true);
      dragStart.current = { x: event.clientX, y: event.clientY };
      elementStart.current = position;
    },
    [draggable, position],
  );

  /**
   * 2. 마우스 이동 핸들러: 이동 거리를 계산하여 실시간 좌표 갱신
   */
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = event.clientX - dragStart.current.x;
      const deltaY = event.clientY - dragStart.current.y;

      setPosition({
        x: elementStart.current.x + deltaX,
        y: elementStart.current.y + deltaY,
      });
    },
    [isDragging],
  );

  /**
   * 3. 드래그 종료 핸들러
   */
  const handleMouseUp = useCallback(() => {
    if (isDragging) setIsDragging(false);
  }, [isDragging]);

  /**
   * 4. 전역 이벤트 바인딩: 드래그 중일 때만 window에 이벤트 등록
   */
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
    handleMouseDown,
  };
}
