import { NodeProps } from '@xyflow/react';
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
      return 'OPEN';
    case ISSUE_STATUS.VOTE:
      return 'VOTING';
    case ISSUE_STATUS.SELECT:
      return 'SELECTING';
    case ISSUE_STATUS.CLOSE:
      return 'CLOSED';
    default:
      return 'UNKNOWN';
  }
}

export default function TopicNode({ data }: NodeProps) {
  const title = (data as TopicNodeData)?.title ?? '홍보 플랫폼 선정';
  const status = (data as TopicNodeData)?.status ?? ISSUE_STATUS.CLOSE;

  return (
    <S.NodeContainer status={status}>
      <S.BadgeWrapper>
        <S.Badge status={status}>{badgeFormatter(status)}</S.Badge>
      </S.BadgeWrapper>

      <S.TitleWrapper>
        <S.Title status={status}>{title}</S.Title>
      </S.TitleWrapper>
    </S.NodeContainer>
  );
}
