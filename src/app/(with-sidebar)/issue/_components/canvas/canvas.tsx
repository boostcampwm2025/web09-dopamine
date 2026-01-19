'use client';

import { useRef } from 'react';
import { ISSUE_STATUS, ISSUE_STATUS_DESCRIPTION } from '@/constants/issue';
import { useIssueData, useIssueId } from '../../hooks';
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
}

export default function Canvas({
  children,
  onDoubleClick,
  showGrid = true,
  showControls = true,
  showMessage = true,
  showAddButton = true,
  boundContent = false,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const issueId = useIssueId();

  const { status } = useIssueData(issueId);
  const isBrainStorming = status == ISSUE_STATUS.BRAINSTORMING;

  const description = ISSUE_STATUS_DESCRIPTION[status];

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
    isAddIdeaEnabled: isBrainStorming,
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
      {showAddButton && isBrainStorming && (
        <AddIdeaButton onClick={handleAddIdeaButtonClick}>아이디어 추가</AddIdeaButton>
      )}
      {showMessage && <BottomMessage>{description}</BottomMessage>}
    </>
  );
}
