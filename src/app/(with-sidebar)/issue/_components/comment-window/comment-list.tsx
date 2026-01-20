'use client';

import { useMemo } from 'react';
import * as S from './comment-window.styles';
import { CommentListContext } from './comment-list-context';
import CommentListItem from './comment-list-item';
import { useCommentWindowContext } from './comment-window-context';

export default function CommentList() {
  const {
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
  } = useCommentWindowContext();

  const getCommentMetaMessage = () => {
    if (isLoading) return '댓글을 불러오는 중...';
    if (errorMessage) return errorMessage;
    if (comments.length === 0) return '등록된 댓글이 없습니다.';
    return null;
  };

  const commentMetaMessage = getCommentMetaMessage();

  const contextValue = useMemo(
    () => ({
      isMutating,
      mutatingCommentId,
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
      expandedCommentIds,
      overflowCommentIds,
      registerCommentBody,
      registerCommentMeasure,
      handleExpand,
    }),
    [
      editingValue,
      expandedCommentIds,
      getDeleteButtonContent,
      getSaveButtonContent,
      handleDelete,
      handleEditCancel,
      handleEditKeyDown,
      handleEditSave,
      handleEditStart,
      handleExpand,
      isCommentOwner,
      isEditingComment,
      isMutating,
      mutatingCommentId,
      overflowCommentIds,
      registerCommentBody,
      registerCommentMeasure,
      setEditingValue,
      shouldShowReadMore,
    ],
  );

  return (
    <CommentListContext.Provider value={contextValue}>
      <S.CommentSection>
        <S.CommentList>
          {commentMetaMessage && (
            <S.CommentItem>
              <S.CommentMeta>{commentMetaMessage}</S.CommentMeta>
            </S.CommentItem>
          )}
          {!isLoading && !errorMessage &&
            comments.map((comment) => (
              <CommentListItem key={comment.id} comment={comment} />
            ))}
        </S.CommentList>
      </S.CommentSection>
    </CommentListContext.Provider>
  );
}
