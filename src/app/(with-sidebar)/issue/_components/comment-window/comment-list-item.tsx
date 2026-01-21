'use client';

import { useCallback } from 'react';
import type { Comment } from '@/lib/api/comment';
import { getCommentMeta } from '@/lib/utils/comment';
import { useCommentListContext } from './comment-list-context';
import * as S from './comment-window.styles';

interface CommentListItemProps {
  comment: Comment;
}

export default function CommentListItem({ comment }: CommentListItemProps) {
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
  } = useCommentListContext();

  const isExpanded = expandedCommentIds.includes(comment.id);
  const canExpand = overflowCommentIds.includes(comment.id);
  const isEditing = isEditingComment(comment.id);
  const canShowActions = isCommentOwner(comment.user?.id);

  const handleEditStartClick = useCallback(
    () => handleEditStart(comment),
    [comment, handleEditStart],
  );
  const handleDeleteClick = useCallback(() => {
    if (isMutating) return;
    handleDelete(comment.id);
  }, [comment.id, handleDelete, isMutating]);
  const handleExpandClick = useCallback(() => handleExpand(comment.id), [comment.id, handleExpand]);

  return (
    <S.CommentItem>
      <S.CommentMeasure ref={registerCommentMeasure(comment.id)}>
        {comment.content}
      </S.CommentMeasure>
      <S.CommentHeader>
        <S.CommentMeta>{getCommentMeta(comment)}</S.CommentMeta>
        {canShowActions && (
          <S.CommentActions>
            {isEditing && (
              <>
                <S.Btn
                  type="button"
                  onClick={handleEditSave}
                  disabled={
                    isMutating ||
                    mutatingCommentId === comment.id ||
                    editingValue.trim().length === 0
                  }
                >
                  {getSaveButtonContent(comment.id)}
                </S.Btn>
                <S.Btn
                  type="button"
                  onClick={handleEditCancel}
                  disabled={isMutating}
                >
                  취소
                </S.Btn>
              </>
            )}
            {!isEditing && (
              <>
                <S.Btn
                  type="button"
                  onClick={handleEditStartClick}
                  disabled={isMutating}
                >
                  수정
                </S.Btn>
                <S.Btn
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isMutating}
                  $variant="danger"
                >
                  {getDeleteButtonContent(comment.id)}
                </S.Btn>
              </>
            )}
          </S.CommentActions>
        )}
      </S.CommentHeader>
      {isEditing && (
        <S.EditInput
          value={editingValue}
          onChange={(event) => setEditingValue(event.target.value)}
          onKeyDown={handleEditKeyDown}
          disabled={isMutating || mutatingCommentId === comment.id}
        />
      )}
      {!isEditing && (
        <>
          <S.CommentBody
            ref={registerCommentBody(comment.id)}
            $isClamped={!isExpanded}
          >
            {comment.content}
          </S.CommentBody>
          {shouldShowReadMore(isExpanded, canExpand) && (
            <S.ReadMoreButton
              type="button"
              onClick={handleExpandClick}
            >
              더보기
            </S.ReadMoreButton>
          )}
        </>
      )}
    </S.CommentItem>
  );
}
