import { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Node, NodeProps, Position } from '@xyflow/react';
import { ISSUE_STATUS } from '@/constants/issue';
import { IssueStatus } from '@/types/issue';
import { useTopicHoverContext } from '../issue-hover-context';
import IssueHandle from './issue-handle';
import * as S from './issue-node.styles';

export interface TopicNodeData extends Record<string, unknown> {
  title?: string;
  status?: IssueStatus;
}

function TopicNode({ id, data }: NodeProps<Node<TopicNodeData>>) {
  const router = useRouter();
  const title = data.title;
  const status = data.status ?? ISSUE_STATUS.CLOSE;
  const { hoveredNodeId, connectedNodeIds } = useTopicHoverContext();
  const dimmed = hoveredNodeId ? !connectedNodeIds.has(id) : false;

  const handleClick = useCallback(() => {
    router.push(`/issue/${id}`);
  }, [id, router]);

  return (
    <S.NodeContainer
      status={status}
      onClick={handleClick}
      style={{
        opacity: dimmed ? 0.3 : 1,
        transition: 'opacity 0.2s ease-in-out',
        cursor: 'pointer',
      }}
    >
      <S.BadgeWrapper>
        <S.Badge status={status}>{status}</S.Badge>
      </S.BadgeWrapper>

      <S.TitleWrapper>
        <S.Title status={status}>{title}</S.Title>
      </S.TitleWrapper>
      {/* 소스와 타깃 모두 지정해서 자유롭게 연결할 수 있음 */}
      {/* Top Handles */}
      <IssueHandle
        type="target"
        status={status}
        position={Position.Top}
        id="top-target"
      />
      <IssueHandle
        type="source"
        status={status}
        position={Position.Top}
        id="top-source"
      />

      {/* Bottom Handles */}
      <IssueHandle
        type="target"
        status={status}
        position={Position.Bottom}
        id="bottom-target"
      />
      <IssueHandle
        type="source"
        status={status}
        position={Position.Bottom}
        id="bottom-source"
      />

      {/* Left Handles */}
      <IssueHandle
        type="target"
        status={status}
        position={Position.Left}
        id="left-target"
      />
      <IssueHandle
        type="source"
        status={status}
        position={Position.Left}
        id="left-source"
      />

      {/* Right Handles */}
      <IssueHandle
        type="target"
        status={status}
        position={Position.Right}
        id="right-target"
      />
      <IssueHandle
        type="source"
        status={status}
        position={Position.Right}
        id="right-source"
      />
    </S.NodeContainer>
  );
}

export default memo(TopicNode);
