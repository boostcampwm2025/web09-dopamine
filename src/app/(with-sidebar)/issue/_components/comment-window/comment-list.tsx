'use client';

import { useMemo } from 'react';
import * as S from './comment-window.styles';
import { useCommentOverflow } from './hooks/use-comment-overflow';
import { CommentListContext } from './comment-list-context';
import CommentListItem from './comment-list-item';
import { useCommentWindowContext } from './comment-window-context';

export default function CommentList() {
  const {
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
  } = useCommentWindowContext();
  const {
    expandedCommentIds,
    overflowCommentIds,
    registerCommentBody,
    registerCommentMeasure,
    handleExpand,
  } = useCommentOverflow({ items: comments });

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
          {shouldShowLoading && (
            <S.CommentItem>
              <S.CommentMeta>댓글을 불러오는 중...</S.CommentMeta>
            </S.CommentItem>
          )}
          {shouldShowError && (
            <S.CommentItem>
              <S.CommentMeta>{errorMessage}</S.CommentMeta>
            </S.CommentItem>
          )}
          {shouldShowEmpty && (
            <S.CommentItem>
              <S.CommentMeta>등록된 댓글이 없습니다.</S.CommentMeta>
            </S.CommentItem>
          )}
          {shouldShowComments &&
            comments.map((comment) => (
              <CommentListItem key={comment.id} comment={comment} />
            ))}
        </S.CommentList>
      </S.CommentSection>
    </CommentListContext.Provider>
  );
}
