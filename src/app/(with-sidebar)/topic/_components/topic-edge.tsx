import React from 'react';
import { useConnection } from '@xyflow/react';
import { EDGE_STYLE } from '@/constants/topic';

interface TopicEdgeProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export default function topicEdge({ fromX, fromY, toX, toY }: TopicEdgeProps) {
  const { fromHandle } = useConnection();

  if (!fromHandle) return null;
  const centerY = (fromY + toY) / 2;

  return (
    <g>
      <path
        fill="none"
        stroke={EDGE_STYLE.stroke}
        strokeWidth={EDGE_STYLE.strokeWidth}
        className="animated"
        d={`M${fromX},${fromY} C ${fromX},${centerY} ${toX},${centerY} ${toX},${toY}`}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        stroke={EDGE_STYLE.stroke}
        strokeWidth={1.5}
      />
    </g>
  );
}
