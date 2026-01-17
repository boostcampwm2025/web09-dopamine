import { useCallback, useState } from 'react';
import { useCanvasStore } from '../store/use-canvas-store';

const DEFAULT_OFFSET = { x: 0, y: 0 };

export function useCanvasInteractions() {
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
  };
}
