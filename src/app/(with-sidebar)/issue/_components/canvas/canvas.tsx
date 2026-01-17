'use client';

import { useRef } from 'react';
import { useCanvasAddIdea } from '@/app/(with-sidebar)/issue/hooks/use-canvas-add-idea';
import { useCanvasInteractions } from '@/app/(with-sidebar)/issue/hooks/use-canvas-interactions';
import { ISSUE_STATUS, ISSUE_STATUS_DESCRIPTION } from '@/constants/issue';
import { useIssueData } from '../../hooks/use-issue-data';
import { useIssueId } from '../../hooks/use-issue-id';
import { CanvasContext } from './canvas-context';
import CanvasZoomControls from './canvas-zoom-controls';
import { AddIdeaButton, BottomMessage, CanvasContainer, CanvasViewport } from './canvas.styles';

interface CanvasProps {
  children?: React.ReactNode;
  onDoubleClick?: (position: { x: number; y: number }) => void;
}

export default function Canvas({ children, onDoubleClick }: CanvasProps) {
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
  } = useCanvasInteractions();

  const { handleCanvasDoubleClick, handleAddIdeaButtonClick } = useCanvasAddIdea({
    canvasRef,
    onDoubleClick,
    isEnabled: isBrainStorming,
    offset,
    scale,
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
        style={{
          cursor: isPanning ? 'grabbing' : 'default',
        }}
      >
        <CanvasViewport
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          <CanvasContext.Provider value={{ scale }}>{children}</CanvasContext.Provider>
        </CanvasViewport>
      </CanvasContainer>

      <CanvasZoomControls
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetZoom}
      />
      {isBrainStorming && (
        <AddIdeaButton onClick={handleAddIdeaButtonClick}>아이디어 추가</AddIdeaButton>
      )}
      <BottomMessage>{description}</BottomMessage>
    </>
  );
}
