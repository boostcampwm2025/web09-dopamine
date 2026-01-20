import { useConnection } from '@xyflow/react';
import { EDGE_STYLE } from '@/constants/topic';
import { theme } from '@/styles/theme';

interface IssueConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

const STROKE_WIDTH = 1.5;

export default function IssueConnectionLine({ fromX, fromY, toX, toY }: IssueConnectionLineProps) {
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
        fill={theme.colors.white}
        r={3}
        stroke={EDGE_STYLE.stroke}
        strokeWidth={STROKE_WIDTH}
      />
    </g>
  );
}
