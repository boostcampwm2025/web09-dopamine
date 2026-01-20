import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type Comment,
  createComment,
  deleteComment,
  updateComment,
} from '@/lib/api/comment';
import { getCommentQueryKey } from './use-comment-query';

interface CreateCommentParams {
  userId: string;
  content: string;
}

interface UpdateCommentParams {
  commentId: string;
  content: string;
}

interface DeleteCommentParams {
  commentId: string;
}

export const useCommentMutations = (issueId: string, ideaId: string) => {
  const queryClient = useQueryClient();
  const commentQueryKey = useMemo(
    () => getCommentQueryKey(issueId, ideaId),
    [ideaId, issueId],
  );

  const createMutation = useMutation({
    mutationFn: ({ userId, content }: CreateCommentParams) =>
      createComment(issueId, ideaId, { userId, content }),
    onSuccess: (created) => {
      queryClient.setQueryData<Comment[]>(commentQueryKey, (prev) => [
        ...(prev ?? []),
        created,
      ]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: UpdateCommentParams) =>
      updateComment(issueId, ideaId, commentId, { content }),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<Comment[]>(commentQueryKey, (prev) =>
        (prev ?? []).map((comment) =>
          comment.id === variables.commentId
            ? { ...comment, ...(updated ?? {}), content: updated?.content ?? variables.content }
            : comment,
        ),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ commentId }: DeleteCommentParams) =>
      deleteComment(issueId, ideaId, commentId),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Comment[]>(commentQueryKey, (prev) =>
        (prev ?? []).filter((comment) => comment.id !== variables.commentId),
      );
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
