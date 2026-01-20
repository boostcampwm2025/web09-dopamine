import Image from 'next/image';
import { BaseEdge, EdgeProps, EdgeToolbar, getBezierPath, useViewport } from '@xyflow/react';
import { EDGE_STYLE } from '@/constants/topic';
import { theme } from '@/styles/theme';

const DELETE_BUTTON_STYLE = {
  width: 20,
  height: 20,
  borderRadius: '50%',
  border: `1px solid ${theme.colors.gray[300]}`,
  background: theme.colors.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
} as const;

const BUTTON_VISIABLE_ZOOM_LEVEL = 0.65;
const STROKE_WIDTH = 1.5;

export default function TopicEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) {
  const { zoom } = useViewport();
  const [edgePath, centerX, centerY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...EDGE_STYLE,
        }}
      />
      <circle
        cx={sourceX}
        cy={sourceY}
        fill={theme.colors.white}
        r={3}
        stroke={EDGE_STYLE.stroke}
        strokeWidth={STROKE_WIDTH}
      />
      <EdgeToolbar
        edgeId={id}
        x={centerX}
        y={centerY}
        isVisible={zoom >= BUTTON_VISIABLE_ZOOM_LEVEL}
      >
        <button style={DELETE_BUTTON_STYLE}>
          <Image
            src="/close.svg"
            alt="Add"
            width={10}
            height={10}
          />
        </button>
      </EdgeToolbar>
      <circle
        cx={targetX}
        cy={targetY}
        fill={theme.colors.white}
        r={3}
        stroke={EDGE_STYLE.stroke}
        strokeWidth={STROKE_WIDTH}
      />
    </>
  );
}
