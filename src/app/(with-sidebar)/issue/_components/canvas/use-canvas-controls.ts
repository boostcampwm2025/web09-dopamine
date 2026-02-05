import { useCallback, useEffect, useRef, useState } from 'react';
import { useStaticClick } from '../../hooks';
import { useCanvasStore } from '../../store/use-canvas-store';

const DEFAULT_OFFSET = { x: 0, y: 0 };

interface UseCanvasControlsOptions {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDoubleClick?: (position: { x: number; y: number }) => void;
  isAddIdeaEnabled: boolean;
  onCanvasClick: (e: React.MouseEvent) => void;
}

export function useCanvasControls({
  canvasRef,
  onDoubleClick,
  isAddIdeaEnabled,
  onCanvasClick,
}: UseCanvasControlsOptions) {
  const { scale, offset, setScale, setOffset, reset } = useCanvasStore();
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(DEFAULT_OFFSET);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // 드래그 판별을 위한 Ref
  const isBackgroundClickRef = useRef(false);
  const { handlePointerDown, handleClick } = useStaticClick(onCanvasClick);

  // Space 키 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // passive 이벤트 리스너 문제를 해결하기 위해 직접 등록
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.3, scale + delta), 3);

        // 마우스 커서 위치를 기준으로 줌
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 줌 전 마우스가 가리키는 캔버스 내 실제 좌표
        const pointX = (mouseX - offset.x) / scale;
        const pointY = (mouseY - offset.y) / scale;

        // 줌 후에도 같은 점을 가리키도록 offset 조정
        const newOffsetX = mouseX - pointX * newScale;
        const newOffsetY = mouseY - pointY * newScale;

        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
      } else {
        setOffset({
          x: offset.x - e.deltaX,
          y: offset.y - e.deltaY,
        });
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [canvasRef, scale, offset, setScale, setOffset]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handlePointerDown(e);
      const target = e.target as HTMLElement;
      // 클릭해도 comment 닫히지 않는 요소들 체크
      if (target.closest('[data-no-canvas-close="true"]')) {
        isBackgroundClickRef.current = false;
      } else {
        isBackgroundClickRef.current = true;
      }

      if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    },
    [offset, isSpacePressed, handlePointerDown],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    },
    [isPanning, panStart, setOffset],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      setIsPanning(false);

      if (isBackgroundClickRef.current) {
        handleClick(e);
      }
    },
    [handleClick],
  );

  const handleZoomIn = useCallback(() => {
    setScale(Math.min(scale + 0.1, 3));
  }, [scale, setScale]);

  const handleZoomOut = useCallback(() => {
    setScale(Math.max(scale - 0.1, 0.3));
  }, [scale, setScale]);

  const handleResetZoom = useCallback(() => {
    reset();
  }, [reset]);

  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!onDoubleClick || !isAddIdeaEnabled) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;

      onDoubleClick({ x, y });
    },
    [canvasRef, isAddIdeaEnabled, onDoubleClick, offset, scale],
  );

  const handleAddIdeaButtonClick = useCallback(() => {
    if (!onDoubleClick) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const CARD_WIDTH = 640;
    const CARD_HEIGHT = 320;

    const centerX = (rect.width / 2 - offset.x) / scale;
    const centerY = (rect.height / 2 - offset.y) / scale;

    const x = centerX - CARD_WIDTH / 2;
    const y = centerY - CARD_HEIGHT / 2;

    onDoubleClick({ x, y });
  }, [canvasRef, onDoubleClick, offset, scale]);

  return {
    scale,
    offset,
    isPanning,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleCanvasDoubleClick,
    handleAddIdeaButtonClick,
  };
}
