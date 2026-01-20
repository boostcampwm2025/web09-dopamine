export type Comment = {
  id: string;
  content: string;
  createdAt: Date | string;
  user?: {
    id: string;
    name: string | null;
    displayName: string | null;
  };
};

/**
 * 특정 아이디어의 모든 댓글 목록을 조회합니다.
 * @param ideaId - 아이디어 식별자
 * @returns 댓글 배열을 포함한 Promise
 */
export async function fetchComments(ideaId: string): Promise<Comment[]> {
  const response = await fetch(`/api/ideas/${ideaId}/comment`);

  if (!response.ok) {
    throw new Error('댓글을 불러오는 데 실패했습니다.');
  }

  const data = await response.json();
  return data.comments;
}

/**
 * 새로운 댓글을 생성합니다.
 * @param ideaId - 아이디어 식별자
 * @param payload - 유저 ID와 댓글 내용을 포함한 객체
 */
export async function createComment(ideaId: string, payload: { userId: string; content: string }) {
  const response = await fetch(`/api/ideas/${ideaId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('댓글을 작성하는 데 실패했습니다.');
  }

  return response.json();
}

/**
 * 기존 댓글의 내용을 수정합니다.
 * @param ideaId - 아이디어 식별자
 * @param commentId - 수정할 댓글 식별자
 * @param payload - 수정할 댓글 내용
 */
export async function updateComment(
  ideaId: string,
  commentId: string,
  payload: { content: string },
) {
  const response = await fetch(`/api/ideas/${ideaId}/comment/${commentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('댓글을 수정하는 데 실패했습니다.');
  }

  return response.json();
}

/**
 * 댓글을 삭제합니다.
 * @param ideaId - 아이디어 식별자
 * @param commentId - 삭제할 댓글 식별자
 */
export async function deleteComment(ideaId: string, commentId: string) {
  const response = await fetch(`/api/ideas/${ideaId}/comment/${commentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('댓글을 삭제하는 데 실패했습니다.');
  }

  return response.json();
}
