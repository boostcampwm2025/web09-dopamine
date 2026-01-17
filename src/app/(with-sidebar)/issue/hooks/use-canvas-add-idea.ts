import { useCallback } from 'react';

interface UseCanvasAddIdeaOptions {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDoubleClick?: (position: { x: number; y: number }) => void;
  isEnabled: boolean;
  offset: { x: number; y: number };
  scale: number;
}

export function useCanvasAddIdea({
  canvasRef,
  onDoubleClick,
  isEnabled,
  offset,
  scale,
}: UseCanvasAddIdeaOptions) {
  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!onDoubleClick || !isEnabled) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;

      onDoubleClick({ x, y });
    },
    [canvasRef, isEnabled, onDoubleClick, offset, scale],
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

  return { handleCanvasDoubleClick, handleAddIdeaButtonClick };
}
