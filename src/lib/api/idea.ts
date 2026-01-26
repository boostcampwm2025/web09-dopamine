import type { CreateIdeaRequest, Idea } from '@/types/idea';
import getAPIResponseData from '../utils/api-response';

type UpdateIdeaPayload = {
  positionX?: number | null;
  positionY?: number | null;
  categoryId?: string | null;
};

// 아이디어 목록 조회
export function fetchIdeas(issueId: string): Promise<Idea[]> {
  return getAPIResponseData<Idea[]>({
    url: `/api/issues/${issueId}/ideas`,
    method: 'GET',
  });
}

// 아이디어 생성
export function createIdea(issueId: string, ideaData: CreateIdeaRequest): Promise<Idea> {
  return getAPIResponseData<Idea>({
    url: `/api/issues/${issueId}/ideas`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ideaData),
  });
}

// 단일 아이디어 조회 (myVote 포함)
export function getIdea(issueId: string, ideaId: string, userId?: string): Promise<Idea> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  return getAPIResponseData<Idea>({
    url: `/api/issues/${issueId}/ideas/${ideaId}`,
    method: 'GET',
    headers,
  });
}

// 아이디어 위치 / 카테고리 수정
export function updateIdea(
  issueId: string,
  ideaId: string,
  payload: UpdateIdeaPayload,
): Promise<Idea> {
  return getAPIResponseData<Idea>({
    url: `/api/issues/${issueId}/ideas/${ideaId}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ideaId, ...payload }),
  });
}

// 아이디어 삭제
export function deleteIdea(issueId: string, ideaId: string): Promise<void> {
  return getAPIResponseData<void>({
    url: `/api/issues/${issueId}/ideas/${ideaId}`,
    method: 'DELETE',
  });
}
