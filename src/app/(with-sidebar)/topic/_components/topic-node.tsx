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
      <Handle
        id="a"
        type="target"
        position={Position.Top}
        style={{ borderRadius: 0 }}
      />
      <Handle
        id="b"
        type="source"
        position={Position.Bottom}
        style={{ borderRadius: 0 }}
      />
    </S.NodeContainer>
  );
}
