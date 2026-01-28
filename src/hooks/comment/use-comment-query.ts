import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCommentCount, fetchComments } from '@/lib/api/comment';

export const getCommentQueryKey = (issueId: string, ideaId: string) => ['comments', issueId, ideaId];

export const getCommentCountQueryKey = (issueId: string, ideaId: string) => [
  'comments',
  issueId,
  ideaId,
  'count', // 댓글 수 쿼리 키
];

export const useCommentQuery = (issueId: string, ideaId: string) => {
  const commentQueryKey = useMemo(() => getCommentQueryKey(issueId, ideaId), [ideaId, issueId]);

  const commentsQuery = useQuery({
    queryKey: commentQueryKey,
    queryFn: () => fetchComments(issueId, ideaId),
    enabled: Boolean(issueId && ideaId),
  });

  return { commentQueryKey, commentsQuery };
};

// 댓글 수 쿼리
export const useCommentCountQuery = (issueId: string, ideaId: string) => {
  const commentCountQueryKey = useMemo(
    () => getCommentCountQueryKey(issueId, ideaId),
    [ideaId, issueId],
  );

  const commentCountQuery = useQuery({
    queryKey: commentCountQueryKey,
    queryFn: () => fetchCommentCount(issueId, ideaId),
    enabled: Boolean(issueId && ideaId),
  });

  return { commentCountQueryKey, commentCountQuery };
};
