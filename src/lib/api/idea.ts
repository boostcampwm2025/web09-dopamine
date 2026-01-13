import type { CreateIdeaRequest, Idea } from '@/types/idea';

export async function fetchIdeas(issueId: string): Promise<Idea[]> {
  try {
    const response = await fetch(`/api/issues/${issueId}/idea`);
    if (response.ok) {
      const data = await response.json();
      return data.ideas;
    }
    return [];
  } catch (error) {
    console.error('아이디어 조회 실패:', error);
    return [];
  }
}

export async function createIdea(issueId: string, ideaData: CreateIdeaRequest): Promise<Idea> {
  const response = await fetch(`/api/issues/${issueId}/idea`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ideaData),
  });

  if (!response.ok) {
    throw new Error('아이디어 생성에 실패했습니다.');
  }

  return response.json();
}

export async function deleteIdea(issueId: string, ideaId: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/issues/${issueId}/idea?ideaId=${ideaId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('아이디어 삭제에 실패했습니다.');
  }

  return response.json();
}

export const getIdea = async (ideaId: string, userId?: string) => {
  //TODO: userId를 클라이언트에서 전달하지 않는 방식으로 수정 필요
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(`/api/ideas/${ideaId}`, {
    method: 'GET',
    headers: headers,
  });

  if (!response.ok) {
    throw new Error('아이디어 조회에 실패했습니다.');
  }

  return response.json();
};
