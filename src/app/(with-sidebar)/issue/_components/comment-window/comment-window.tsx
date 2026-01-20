'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import CommentList from './comment-list';
import * as S from './comment-window.styles';
import { useWindow } from './hooks/use-window';
import { CommentWindowContext } from './comment-window-context';

export interface CommentWindowProps {
  issueId: string;
  ideaId: string;
  userId: string;
  initialPosition?: { x: number; y: number };
  onClose?: () => void;
}

export default function CommentWindow({
  issueId,
  ideaId,
  userId,
  initialPosition,
  onClose,
}: CommentWindowProps) {
  const fixedWidth = 420;
  const fixedHeight = 500;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const {
    position,
    comments,
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
  } = useWindow({ initialPosition, issueId, ideaId, userId });

  const commentContextValue = useMemo(
    () => ({
      comments,
      errorMessage,
      isMutating,
      mutatingCommentId,
      shouldShowLoading,
      shouldShowError,
      shouldShowEmpty,
      shouldShowComments,
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
      isMutating,
      mutatingCommentId,
      setEditingValue,
      shouldShowComments,
      shouldShowEmpty,
      shouldShowError,
      shouldShowLoading,
      shouldShowReadMore,
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

  return (
    <S.Window
      role="dialog"
      aria-label="댓글"
      style={{ left: position.x, top: position.y, width: fixedWidth, height: fixedHeight }}
      onPointerDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
      onWheelCapture={(event) => event.stopPropagation()}
    >
      <S.Header>
        <S.Title>댓글</S.Title>
        <S.Controls>
          <S.CloseButton
            type="button"
            aria-label="Close"
            onClick={onClose}
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
              {isSubmitting ? '제출중...' : '제출'}
            </S.SubmitButton>
          </S.InputRow>
        </S.Section>
      </S.Body>
    </S.Window>
  );
}
