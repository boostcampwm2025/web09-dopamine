import type { IssueConnection, IssueMapData, IssueNode } from '@/types/issue';
import getAPIResponseData from '../utils/api-response';

type CreateConnectionPayload = {
  issueAId: string;
  issueBId: string;
  sourceHandle: string | null;
  targetHandle: string | null;
};

type UpdateNodePositionPayload = {
  positionX: number;
  positionY: number;
};

// 이슈 조회
export function getTopicIssues(topicId: string): Promise<IssueMapData[]> {
  return getAPIResponseData<IssueMapData[]>({
    url: `/api/topics/${topicId}/issues`,
    method: 'GET',
  });
}

// 노드 조회
export function getTopicNodes(topicId: string): Promise<IssueNode[]> {
  return getAPIResponseData<IssueNode[]>({
    url: `/api/topics/${topicId}/nodes`,
    method: 'GET',
  });
}

// 연결 조회
export function getTopicConnections(topicId: string): Promise<IssueConnection[]> {
  return getAPIResponseData<IssueConnection[]>({
    url: `/api/topics/${topicId}/connections`,
    method: 'GET',
  });
}

// 연결 생성
export function createConnection(
  topicId: string,
  payload: CreateConnectionPayload,
): Promise<IssueConnection> {
  return getAPIResponseData<IssueConnection>({
    url: `/api/topics/${topicId}/connections`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// 연결 삭제
export function deleteConnection(topicId: string, connectionId: string): Promise<void> {
  return getAPIResponseData<void>({
    url: `/api/topics/${topicId}/connections/${connectionId}`,
    method: 'DELETE',
  });
}

// 노드 위치 업데이트
export function updateNodePosition(
  topicId: string,
  nodeId: string,
  payload: UpdateNodePositionPayload,
): Promise<IssueNode> {
  return getAPIResponseData<IssueNode>({
    url: `/api/topics/${topicId}/nodes/${nodeId}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
