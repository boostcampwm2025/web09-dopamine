import { Node, NodeProps, Position } from '@xyflow/react';
import { ISSUE_STATUS } from '@/constants/issue';
import { IssueStatus } from '@/types/issue';
import TopicHandle from './topic-handle';
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
      <TopicHandle
        type="target"
        status={status}
        position={Position.Top}
        id="top-target"
      />
      <TopicHandle
        type="source"
        status={status}
        position={Position.Top}
        id="top-source"
      />

      {/* Bottom Handles */}
      <TopicHandle
        type="target"
        status={status}
        position={Position.Bottom}
        id="bottom-target"
      />
      <TopicHandle
        type="source"
        status={status}
        position={Position.Bottom}
        id="bottom-source"
      />

      {/* Left Handles */}
      <TopicHandle
        type="target"
        status={status}
        position={Position.Left}
        id="left-target"
      />
      <TopicHandle
        type="source"
        status={status}
        position={Position.Left}
        id="left-source"
      />

      {/* Right Handles */}
      <TopicHandle
        type="target"
        status={status}
        position={Position.Right}
        id="right-target"
      />
      <TopicHandle
        type="source"
        status={status}
        position={Position.Right}
        id="right-source"
      />
    </S.NodeContainer>
  );
}
