'use client';

import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import type { Comment } from '@/lib/api/comment';
import { getCommentMeta } from '@/lib/utils/comment';
import * as S from './comment-window.styles';
import { useCommentOverflow } from './hooks/use-comment-overflow';

interface CommentListProps {
  comments: Comment[];
  errorMessage: string | null;
  isMutating: boolean;
  mutatingCommentId: string | null;
  shouldShowLoading: boolean;
  shouldShowError: boolean;
  shouldShowEmpty: boolean;
  shouldShowComments: boolean;
  editingValue: string;
  setEditingValue: (value: string) => void;
  isCommentOwner: (commentUserId?: string) => boolean;
  isEditingComment: (commentId: string) => boolean;
  getSaveButtonContent: (commentId: string) => string;
  getDeleteButtonContent: (commentId: string) => string;
  shouldShowReadMore: (isExpanded: boolean, canExpand: boolean) => boolean;
  handleEditStart: (comment: Comment) => void;
  handleEditCancel: () => void;
  handleEditSave: () => void;
  handleEditKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  handleDelete: (commentId: string) => void;
}

export default function CommentList({
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
}: CommentListProps) {
  const {
    expandedCommentIds,
    overflowCommentIds,
    registerCommentBody,
    registerCommentMeasure,
    handleExpand,
  } = useCommentOverflow({ items: comments });

  const handleDeleteClick = useCallback(
    (commentId: string) => {
      if (isMutating) return;
      handleDelete(commentId);
    },
    [handleDelete, isMutating],
  );
  const getEditStartHandler = useCallback(
    (comment: Comment) => () => handleEditStart(comment),
    [handleEditStart],
  );
  const getDeleteHandler = useCallback(
    (commentId: string) => () => handleDeleteClick(commentId),
    [handleDeleteClick],
  );
  const getExpandHandler = useCallback(
    (commentId: string) => () => handleExpand(commentId),
    [handleExpand],
  );

  return (
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
          comments.map((comment) => {
            const isExpanded = expandedCommentIds.includes(comment.id);
            const canExpand = overflowCommentIds.includes(comment.id);
            const isEditing = isEditingComment(comment.id);
            const canShowActions = isCommentOwner(comment.user?.id);
            const handleEditStartClick = getEditStartHandler(comment);
            const handleDeleteClickById = getDeleteHandler(comment.id);
            const handleExpandClick = getExpandHandler(comment.id);

              return (
                <S.CommentItem key={comment.id}>
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
                              onClick={handleDeleteClickById}
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
            })}
      </S.CommentList>
    </S.CommentSection>
  );
}
