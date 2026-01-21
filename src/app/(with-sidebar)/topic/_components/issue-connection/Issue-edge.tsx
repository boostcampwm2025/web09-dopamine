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

interface IssueEdgeProps extends EdgeProps {
  onDelete?: (edgeId: string) => void;
}

export default function IssueEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  onDelete,
}: IssueEdgeProps) {
  const { zoom } = useViewport();
  const [edgePath, centerX, centerY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

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
        <button
          style={DELETE_BUTTON_STYLE}
          onClick={handleDelete}
        >
          <Image
            src="/close.svg"
            alt="Add"
            width={10}
            height={10}
          />
        </button>
      </EdgeToolbar>
    </>
  );
}
