import getAPIResponseData from '../utils/api-response';

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
 * @param id - 이슈 식별자
 * @param ideaId - 아이디어 식별자
 * @returns 댓글 배열을 포함한 Promise
 */
export async function fetchComments(id: string, ideaId: string): Promise<Comment[]> {
  return getAPIResponseData<Comment[]>({
    url: `/api/issues/${id}/ideas/${ideaId}/comments`,
    method: 'GET',
  });
}

/**
 * 새로운 댓글을 생성합니다.
 * @param id - 이슈 식별자
 * @param ideaId - 아이디어 식별자
 * @param payload - 유저 ID와 댓글 내용을 포함한 객체
 */
export async function createComment(
  id: string,
  ideaId: string,
  payload: { userId: string; content: string },
) {
  return getAPIResponseData<Comment>({
    url: `/api/issues/${id}/ideas/${ideaId}/comments`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * 기존 댓글의 내용을 수정합니다.
 * @param id - 이슈 식별자
 * @param ideaId - 아이디어 식별자
 * @param commentId - 수정할 댓글 식별자
 * @param payload - 수정할 댓글 내용
 */
export async function updateComment(
  issueId: string,
  ideaId: string,
  commentId: string,
  payload: { content: string },
) {
  return getAPIResponseData<Comment>({
    url: `/api/issues/${issueId}/ideas/${ideaId}/comments/${commentId}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * 댓글을 삭제합니다.
 * @param id - 이슈 식별자
 * @param ideaId - 아이디어 식별자
 * @param commentId - 삭제할 댓글 식별자
 */
export async function deleteComment(issueId: string, ideaId: string, commentId: string) {
  return getAPIResponseData<void>({
    url: `/api/issues/${issueId}/ideas/${ideaId}/comments/${commentId}`,
    method: 'DELETE',
  });
}

/**
 * 특정 아이디어의 댓글 개수를 조회합니다.
 * @param issueId - 이슈 식별자
 * @param ideaId - 아이디어 식별자
 */
export async function fetchCommentCount(issueId: string, ideaId: string): Promise<number> {
  const result = await getAPIResponseData<{ count: number }>({
    url: `/api/issues/${issueId}/ideas/${ideaId}/comments/count`,
    method: 'GET',
  });
  return result.count;
}
