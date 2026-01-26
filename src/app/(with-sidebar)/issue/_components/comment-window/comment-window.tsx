'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import CommentList from './comment-list';
import { CommentWindowContext } from './comment-window-context';
import * as S from './comment-window.styles';
import { useCommentMutations } from './hooks/react-query/use-comment-mutations';
import { useCommentQuery } from './hooks/react-query/use-comment-query';
import { useCommentList } from './hooks/use-comment-list';
import { getCommentErrorMessage, useCommentWindow } from './hooks/use-comment-window';

export interface CommentWindowProps {
  issueId: string;
  ideaId: string;
  userId: string;
  initialPosition?: { x: number; y: number } | null;
  scale?: number;
  onClose?: () => void;
}

export default function CommentWindow({
  issueId,
  ideaId,
  userId,
  initialPosition,
  scale = 1,
  onClose,
}: CommentWindowProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const { commentsQuery } = useCommentQuery(issueId, ideaId);
  const { createMutation, updateMutation, deleteMutation } = useCommentMutations(issueId, ideaId);
  const isLoading = commentsQuery.isLoading;
  const isSubmitting = createMutation.isPending;
  const comments = commentsQuery.data ?? [];
  const errorMessage = getCommentErrorMessage({
    issueId,
    ideaId,
    commentsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  });

  const { inputValue, setInputValue, handleSubmit, handleInputKeyDown } = useCommentWindow({
    initialPosition,
    issueId,
    ideaId,
    userId,
    createMutation,
  });

  const {
    isMutating,
    mutatingCommentId,
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
  } = useCommentList({
    issueId,
    ideaId,
    userId,
    comments,
    isSubmitting,
    updateMutation,
    deleteMutation,
  });

  const commentContextValue = useMemo(
    () => ({
      comments,
      errorMessage,
      isLoading,
      isMutating,
      mutatingCommentId,
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
    }),
    [
      comments,
      editingValue,
      errorMessage,
      getDeleteButtonContent,
      getSaveButtonContent,
      handleDelete,
      handleEditCancel,
      handleEditKeyDown,
      handleEditSave,
      handleEditStart,
      isCommentOwner,
      isEditingComment,
      isLoading,
      isMutating,
      mutatingCommentId,
      setEditingValue,
      shouldShowReadMore,
      expandedCommentIds,
      overflowCommentIds,
      registerCommentBody,
      registerCommentMeasure,
      handleExpand,
    ],
  );

  const resizeTextarea = useCallback((element?: HTMLTextAreaElement | null) => {
    const target = element ?? textareaRef.current;
    if (!target) return;

    target.style.height = 'auto';
    const styles = window.getComputedStyle(target);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 0;
    const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
    const maxHeight = lineHeight * 5 + paddingTop + paddingBottom;
    const nextHeight = Math.min(target.scrollHeight, maxHeight);

    target.style.height = `${nextHeight}px`;
    target.style.overflowY = target.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [inputValue, resizeTextarea]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(event.target.value);
      resizeTextarea(event.target);
    },
    [resizeTextarea, setInputValue],
  );

  const handleSubmitClick = useCallback(() => {
    handleSubmit(textareaRef.current ?? undefined);
  }, [handleSubmit]);

  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      onClose?.();
    },
    [onClose],
  );

  // 클릭 시 이벤트 전파 방지
  const handleWindowClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  // 포인터 다운 시 이벤트 전파 방지
  const handleWindowPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  // 휠 이벤트 전파 방지
  const handleWindowWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  // 휠 캡처 이벤트 전파 방지
  const handleWindowWheelCapture = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  return (
    <S.Window
      role="dialog"
      aria-label="댓글"
      onClick={handleWindowClick}
      onPointerDown={handleWindowPointerDown}
      onWheel={handleWindowWheel}
      onWheelCapture={handleWindowWheelCapture}
    >
      <S.Header>
        <S.Title>댓글</S.Title>
        <S.Controls>
          <S.CloseButton
            type="button"
            aria-label="Close"
            onClick={handleClose}
          >
            &times;
          </S.CloseButton>
        </S.Controls>
      </S.Header>
      <S.Body>
        <CommentWindowContext.Provider value={commentContextValue}>
          <CommentList />
        </CommentWindowContext.Provider>
        <S.Section>
          <S.InputRow>
            <S.Input
              placeholder="댓글 입력"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              disabled={isSubmitting}
              rows={1}
              ref={textareaRef}
            />
            <S.SubmitButton
              type="button"
              onClick={handleSubmitClick}
              disabled={isSubmitting}
            >
              {getSaveButtonContent('create')}
            </S.SubmitButton>
          </S.InputRow>
        </S.Section>
      </S.Body>
    </S.Window>
  );
}
