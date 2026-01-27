'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Comment } from '@/lib/api/comment';
import type { useCommentMutations } from '@/hooks/comment';

interface UseCommentListOptions {
  issueId: string;
  ideaId: string;
  userId: string;
  comments: Comment[];
  isSubmitting: boolean;
  updateMutation: ReturnType<typeof useCommentMutations>['updateMutation'];
  deleteMutation: ReturnType<typeof useCommentMutations>['deleteMutation'];
}

export function useCommentList({
  issueId,
  ideaId,
  userId,
  comments,
  isSubmitting,
  updateMutation,
  deleteMutation,
}: UseCommentListOptions) {
  const [mutatingCommentId, setMutatingCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [expandedCommentIds, setExpandedCommentIds] = useState<string[]>([]);
  const [overflowCommentIds, setOverflowCommentIds] = useState<string[]>([]);
  const commentBodyRefs = useRef(new Map<string, HTMLDivElement | null>());
  const commentMeasureRefs = useRef(new Map<string, HTMLDivElement | null>());
  const isMutating = updateMutation.isPending || deleteMutation.isPending;

  const isCommentOwner = useCallback(
    (commentUserId?: string) => commentUserId === userId,
    [userId],
  );

  const isEditingComment = useCallback(
    (commentId: string) => editingCommentId === commentId,
    [editingCommentId],
  );

  const getSaveButtonContent = useCallback(
    (commentId: string) => {
      if (commentId === 'create' && isSubmitting) return '저장중...';
      return mutatingCommentId === commentId ? '저장중...' : '저장';
    },
    [isSubmitting, mutatingCommentId],
  );

  const getDeleteButtonContent = useCallback(
    (commentId: string) => (mutatingCommentId === commentId ? '삭제중...' : '삭제'),
    [mutatingCommentId],
  );

  const shouldShowReadMore = useCallback(
    (isExpanded: boolean, canExpand: boolean) => !isExpanded && canExpand,
    [],
  );

  const handleExpand = useCallback((commentId: string) => {
    setExpandedCommentIds((prev) => (prev.includes(commentId) ? prev : [...prev, commentId]));
  }, []);

  const registerCommentBody = useCallback(
    (commentId: string) => (node: HTMLDivElement | null) => {
      commentBodyRefs.current.set(commentId, node);
    },
    [],
  );

  const registerCommentMeasure = useCallback(
    (commentId: string) => (node: HTMLDivElement | null) => {
      commentMeasureRefs.current.set(commentId, node);
    },
    [],
  );

  const measureOverflow = useCallback(() => {
    const next = new Set<string>();
    commentMeasureRefs.current.forEach((measureNode, commentId) => {
      const bodyNode = commentBodyRefs.current.get(commentId);
      if (!measureNode || !bodyNode) return;
      const fullHeight = measureNode.offsetHeight;
      const clampedHeight = bodyNode.clientHeight;
      if (fullHeight > clampedHeight + 1) next.add(commentId);
    });

    setOverflowCommentIds((prev) => {
      if (prev.length === next.size && prev.every((id) => next.has(id))) {
        return prev;
      }
      return Array.from(next);
    });
  }, []);

  useEffect(() => {
    measureOverflow();
  }, [comments, expandedCommentIds, measureOverflow]);

  useEffect(() => {
    const handleResize = () => measureOverflow();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [measureOverflow]);

  const handleEditStart = useCallback((comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingValue(comment.content);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingCommentId(null);
    setEditingValue('');
  }, []);

  const handleEditSave = useCallback(async () => {
    const trimmed = editingValue.trim();
    if (!issueId || !ideaId || !editingCommentId || !trimmed || isMutating) return;

    setMutatingCommentId(editingCommentId);
    try {
      await updateMutation.mutateAsync({ commentId: editingCommentId, content: trimmed });
      setEditingCommentId(null);
      setEditingValue('');
    } catch {
      // tanstack error state에 의해 에러 처리
    } finally {
      setMutatingCommentId(null);
    }
  }, [editingCommentId, editingValue, ideaId, isMutating, issueId, updateMutation]);

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!issueId || !ideaId || isMutating) return;

      setMutatingCommentId(commentId);
      try {
        await deleteMutation.mutateAsync({ commentId });
        if (editingCommentId === commentId) {
          setEditingCommentId(null);
          setEditingValue('');
        }
      } catch {
        // handled by tanstack error state
      } finally {
        setMutatingCommentId(null);
      }
    },
    [deleteMutation, editingCommentId, ideaId, isMutating, issueId],
  );

  const handleEditKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.nativeEvent.isComposing) {
        return;
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleEditSave();
      }
    },
    [handleEditSave],
  );

  return {
    isMutating,
    mutatingCommentId,
    editingCommentId,
    editingValue,
    setEditingValue,
    isCommentOwner,
    isEditingComment,
    getSaveButtonContent,
    getDeleteButtonContent,
    shouldShowReadMore,
    expandedCommentIds,
    overflowCommentIds,
    registerCommentBody,
    registerCommentMeasure,
    handleExpand,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    handleEditKeyDown,
    handleDelete,
  };
}
