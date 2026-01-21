import { Handle, Position } from '@xyflow/react';
import { IssueStatus } from '@/types/issue';
import './topic-handle.css';

interface TopicHandleProps {
  type: 'source' | 'target';
  position: Position;
  status: IssueStatus;
  id: string;
  isConnectable?: boolean;
}

const DEFAULT_HANDLE_STYLE = {
  width: 10,
  height: 10,
  borderRadius: 16,
  border: 'none',
  background: '#b1b1b7',
  opacity: 0,
  transition: 'opacity 0.2s',
};

function colorSelector(status: IssueStatus) {
  switch (status) {
    case 'BRAINSTORMING':
    case 'CATEGORIZE':
      return '#3b82f6'; // BLUE
    case 'VOTE':
    case 'SELECT':
      return '#10b981'; // GREEN
    case 'CLOSE':
      return '#6b7280'; // GRAY
    default:
      return '#b1b1b7'; // DEFAULT GRAY
  }
}

export default function TopicHandle({
  type,
  position,
  id,
  status,
  isConnectable = true,
}: TopicHandleProps) {
  const color = colorSelector(status);
  return (
    <Handle
      type={type}
      position={position}
      id={id}
      style={{ ...DEFAULT_HANDLE_STYLE, background: color }}
      isConnectable={isConnectable}
    />
  );
}
