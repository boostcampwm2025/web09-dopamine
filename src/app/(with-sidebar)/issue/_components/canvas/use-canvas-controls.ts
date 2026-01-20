import { useCallback, useState } from 'react';
import { useCanvasStore } from '../../store/use-canvas-store';

const DEFAULT_OFFSET = { x: 0, y: 0 };

interface UseCanvasControlsOptions {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDoubleClick?: (position: { x: number; y: number }) => void;
  isAddIdeaEnabled: boolean;
}

export function useCanvasControls({
  canvasRef,
  onDoubleClick,
  isAddIdeaEnabled,
}: UseCanvasControlsOptions) {
  const { scale, offset, setScale, setOffset, reset } = useCanvasStore();
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(DEFAULT_OFFSET);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.3, scale + delta), 3);
        setScale(newScale);
      } else {
        setOffset({
          x: offset.x - e.deltaX,
          y: offset.y - e.deltaY,
        });
      }
    },
    [scale, offset, setScale, setOffset],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    },
    [offset],
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

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

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
    handleWheel,
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
