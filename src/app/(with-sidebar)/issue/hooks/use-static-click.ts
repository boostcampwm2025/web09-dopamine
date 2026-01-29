import { useCallback, useRef } from 'react';

/**
 * 드래그와 클릭을 구분해주는 훅
 * @param onClick 클릭으로 인정될 때 실행할 함수
 * @param threshold 이 거리 미만일 때만 클릭으로 인정 (기본 5px)
 */
export function useStaticClick(onClick: (e: React.MouseEvent) => void, threshold = 5) {
  const startPosRef = useRef({ x: 0, y: 0 });

  // 1. 마우스 누를 때 좌표 저장
  const handlePointerDown = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    startPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  // 2. 클릭(마우스 뗄 때) 시 이동 거리 검사
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const moveX = Math.abs(e.clientX - startPosRef.current.x);
      const moveY = Math.abs(e.clientY - startPosRef.current.y);

      const hasMoved = moveX > threshold || moveY > threshold;

      // "움직이지 않았을 때"만 클릭 실행
      if (!hasMoved) {
        onClick(e);
      }
    },
    [onClick, threshold],
  );

  return { handlePointerDown, handleClick };
}
