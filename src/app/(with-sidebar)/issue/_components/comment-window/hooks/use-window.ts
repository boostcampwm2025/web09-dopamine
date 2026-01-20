'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  type Comment,
  createComment,
  deleteComment,
  fetchComments,
  updateComment,
} from '@/lib/api/comment';
import { useTooltipStore } from '@/components/tooltip/use-tooltip-store';

interface UseWindowOptions {
  initialPosition?: { x: number; y: number };
  issueId: string;
  ideaId: string;
  userId: string;
}

export function useWindow({ initialPosition, issueId, ideaId, userId }: UseWindowOptions) {
  const defaultPositionRef = useRef({ x: 120, y: 120 });
  const resolvedInitialPosition = initialPosition ?? defaultPositionRef.current;

  const [position, setPosition] = useState(resolvedInitialPosition);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [mutatingCommentId, setMutatingCommentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const openTooltip = useTooltipStore((state) => state.openTooltip);
  const closeTooltip = useTooltipStore((state) => state.closeTooltip);
  const shouldShowLoading = isLoading;
  const shouldShowError = !isLoading && Boolean(errorMessage);
  const shouldShowEmpty = !isLoading && !errorMessage && comments.length === 0;
  const shouldShowComments = !isLoading && !errorMessage;
  const isCommentOwner = useCallback(
    (commentUserId?: string) => commentUserId === userId,
    [userId],
  );
  const isEditingComment = useCallback(
    (commentId: string) => editingCommentId === commentId,
    [editingCommentId],
  );
  const getSaveButtonContent = useCallback(
    (commentId: string) => (mutatingCommentId === commentId ? '저장중...' : '저장'),
    [mutatingCommentId],
  );
  const getDeleteButtonContent = useCallback(
    (commentId: string) => (mutatingCommentId === commentId ? '삭제중...' : '삭제'),
    [mutatingCommentId],
  );
  const shouldShowReadMore = useCallback(
    (isExpanded: boolean, canExpand: boolean) => !isExpanded && canExpand,
    [],
  );

  // 외부에서 전달된 초기 위치 값이 변경될 때 상태 동기화
  useEffect(() => {
    if (!initialPosition) return;
    setPosition(initialPosition);
  }, [initialPosition?.x, initialPosition?.y]);

  /**
   * [조회 로직] 아이디어 ID가 바뀔 때마다 해당 아이디어의 댓글 목록을 서버에서 가져옵니다.
   */
  useEffect(() => {
    if (!issueId || !ideaId) {
      setComments([]);
      setErrorMessage('아이디어 정보가 없어 댓글을 불러올 수 없습니다.');
      return;
    }

    let isActive = true; // 언마운트 시점의 메모리 누수 및 상태 업데이트 방지용 플래그
    setIsLoading(true);
    setErrorMessage(null);

    fetchComments(issueId, ideaId)
      .then((data) => {
        if (!isActive) return;
        setComments(data);
      })
      .catch((error) => {
        if (!isActive) return;
        setErrorMessage(error instanceof Error ? error.message : '댓글을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [ideaId, issueId]);

  /**
   * [생성 로직] 새로운 댓글을 등록합니다. 중복 제출을 방지하고 성공 시 목록을 갱신합니다.
   */
  const handleSubmit = useCallback(async (target?: HTMLElement) => {
    const trimmed = inputValue.trim();
    // 유효성 검사: 내용이 없거나 이미 제출 중인 경우 중단
    if (!trimmed || !issueId || !ideaId || !userId || isSubmitting) {
      if (!trimmed && target) {
        openTooltip(target, '댓글 내용을 입력해주세요.');
        const timer = setTimeout(() => {
          closeTooltip();
        }, 1000);

        return () => clearTimeout(timer);
      }
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await createComment(issueId, ideaId, { userId, content: trimmed });
      // 낙관적 업데이트 대신 실제 생성된 데이터를 리스트에 추가
      setComments((prev) => [...prev, created]);
      setInputValue('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '댓글을 등록하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [ideaId, inputValue, isSubmitting, issueId, openTooltip, userId]);

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

    setIsMutating(true);
    setMutatingCommentId(editingCommentId);
    setErrorMessage(null);
    try {
      const updated = await updateComment(issueId, ideaId, editingCommentId, { content: trimmed });
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === editingCommentId
            ? { ...comment, ...(updated ?? {}), content: updated?.content ?? trimmed }
            : comment,
        ),
      );
      setEditingCommentId(null);
      setEditingValue('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '?“ê????˜ì •?˜ì? ëª»í–ˆ?µë‹ˆ??');
    } finally {
      setIsMutating(false);
      setMutatingCommentId(null);
    }
  }, [editingCommentId, editingValue, ideaId, isMutating, issueId]);

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!issueId || !ideaId || isMutating) return;

      setIsMutating(true);
      setMutatingCommentId(commentId);
      setErrorMessage(null);
      try {
        await deleteComment(issueId, ideaId, commentId);
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
        if (editingCommentId === commentId) {
          setEditingCommentId(null);
          setEditingValue('');
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : '댓글을 삭제하지 못했습니다.');
      } finally {
        setIsMutating(false);
        setMutatingCommentId(null);
      }
    },
    [editingCommentId, ideaId, isMutating, issueId],
  );

  /**
   * [입력 핸들링] 인풋창에서 Enter 키를 눌렀을 때 제출 함수를 실행합니다.
   */
  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit(event.currentTarget);
      }
    },
    [handleSubmit],
  );

  const handleEditKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleEditSave();
      }
    },
    [handleEditSave],
  );

  return {
    position,
    comments,
    isLoading,
    isSubmitting,
    isMutating,
    mutatingCommentId,
    errorMessage,
    inputValue,
    setInputValue,
    handleSubmit,
    handleInputKeyDown,
    shouldShowLoading,
    shouldShowError,
    shouldShowEmpty,
    shouldShowComments,
    editingCommentId,
    editingValue,
    setEditingValue,
    isCommentOwner,
    isEditingComment,
    getSaveButtonContent,
    getDeleteButtonContent,
    shouldShowReadMore,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    handleDelete,
    handleEditKeyDown,
    closeTooltip,
  };
}
