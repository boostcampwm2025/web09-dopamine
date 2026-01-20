'use client';

import { useRef } from 'react';
import { CanvasContext } from './canvas-context';
import CanvasZoomControls from './canvas-zoom-controls';
import { AddIdeaButton, BottomMessage, CanvasContainer, CanvasViewport } from './canvas.styles';
import { useCanvasControls } from './use-canvas-controls';

interface CanvasProps {
  children?: React.ReactNode;
  onDoubleClick?: (position: { x: number; y: number }) => void;
  showGrid?: boolean;
  showControls?: boolean;
  showMessage?: boolean;
  showAddButton?: boolean;
  boundContent?: boolean;
  bottomMessage?: string;
  enableAddIdea?: boolean;
}

export default function Canvas({
  children,
  onDoubleClick,
  showGrid = true,
  showControls = true,
  showMessage = true,
  showAddButton = true,
  boundContent = false,
  bottomMessage = '',
  enableAddIdea = false,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useCanvasControls({
    canvasRef,
    onDoubleClick,
    isAddIdeaEnabled: enableAddIdea,
  });

  return (
    <>
      <CanvasContainer
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleCanvasDoubleClick}
        showGrid={showGrid}
        style={{
          cursor: isPanning ? 'grabbing' : 'default',
        }}
      >
        <CanvasViewport
          boundContent={boundContent}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          <CanvasContext.Provider value={{ scale }}>{children}</CanvasContext.Provider>
        </CanvasViewport>
      </CanvasContainer>

      {showControls && (
        <CanvasZoomControls
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleResetZoom}
        />
      )}
      {showAddButton && enableAddIdea && (
        <AddIdeaButton onClick={handleAddIdeaButtonClick}>아이디어 추가</AddIdeaButton>
      )}
      {showMessage && <BottomMessage>{bottomMessage}</BottomMessage>}
    </>
  );
}
