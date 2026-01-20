import { memo, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { theme } from '@/styles/theme';
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
      return theme.colors.blue[500]; // BLUE
    case 'VOTE':
    case 'SELECT':
      return theme.colors.green[500]; // GREEN
    case 'CLOSE':
      return theme.colors.gray[500]; // GRAY
    default:
      return theme.colors.gray[500]; // DEFAULT GRAY
  }
}

function TopicHandle({ type, position, id, status, isConnectable = true }: TopicHandleProps) {
  const color = colorSelector(status);
  const handleStyle = useMemo(() => {
    return { ...DEFAULT_HANDLE_STYLE, background: color };
  }, [color]);
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

export default memo(TopicHandle);
