import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { ISSUE_STATUS } from '@/constants/issue';
import { IssueStatus } from '@/types/issue';
import * as S from './topic-node.styles';

export interface TopicNodeData extends Record<string, unknown> {
  title?: string;
  status?: IssueStatus;
}

function badgeFormatter(status: IssueStatus) {
  switch (status) {
    case ISSUE_STATUS.BRAINSTORMING:
    case ISSUE_STATUS.CATEGORIZE:
      return 'BLUE';
    case ISSUE_STATUS.VOTE:
    case ISSUE_STATUS.SELECT:
      return 'GREEN';
    case ISSUE_STATUS.CLOSE:
      return 'GRAY';
    default:
      return 'UNKNOWN';
  }
}

export default function TopicNode({ data }: NodeProps<Node<TopicNodeData>>) {
  const title = data.title ?? '홍보 플랫폼 선정';
  const status = data.status ?? ISSUE_STATUS.CLOSE;

  return (
    <S.NodeContainer status={status}>
      <S.BadgeWrapper>
        <S.Badge status={status}>{status}</S.Badge>
      </S.BadgeWrapper>

      <S.TitleWrapper>
        <S.Title status={status}>{title}</S.Title>
      </S.TitleWrapper>
      {/* 소스와 타깃 모두 지정해서 자유롭게 연결할 수 있음 */}
      {/* Top Handles */}
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        style={{ borderRadius: 0 }}
      />
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        style={{ borderRadius: 0 }}
      />

      {/* Bottom Handles */}
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        style={{ borderRadius: 0 }}
      />
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        style={{ borderRadius: 0 }}
      />

      {/* Left Handles */}
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        style={{ borderRadius: 0 }}
      />
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        style={{ borderRadius: 0 }}
      />

      {/* Right Handles */}
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        style={{ borderRadius: 0 }}
      />
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        style={{ borderRadius: 0 }}
      />
    </S.NodeContainer>
  );
}
