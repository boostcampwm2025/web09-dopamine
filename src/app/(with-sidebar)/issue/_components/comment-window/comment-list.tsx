'use client';

import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { useModalStore } from '@/components/modal/use-modal-store';
import type { Comment } from '@/lib/api/comment';
import { getCommentMeta } from '@/lib/utils/comment';
import * as S from './comment-window.styles';
import { useCommentOverflow } from './hooks/use-comment-overflow';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  errorMessage: string | null;
  userId: string;
  isMutating: boolean;
  mutatingCommentId: string | null;
  editingCommentId: string | null;
  editingValue: string;
  setEditingValue: (value: string) => void;
  handleEditStart: (comment: Comment) => void;
  handleEditCancel: () => void;
  handleEditSave: () => void;
  handleEditKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  handleDelete: (commentId: string) => void;
}

export default function CommentList({
  comments,
  isLoading,
  errorMessage,
  userId,
  isMutating,
  mutatingCommentId,
  editingCommentId,
  editingValue,
  setEditingValue,
  handleEditStart,
  handleEditCancel,
  handleEditSave,
  handleEditKeyDown,
  handleDelete,
}: CommentListProps) {
  const { openModal, closeModal } = useModalStore();
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

      openModal({
        title: '?“ê? ?? œ',
        content: (
          <S.ConfirmBox>
            <S.ConfirmMessage>?•ë§ ?? œ? ê¹Œ??</S.ConfirmMessage>
            <S.ConfirmActions>
              <S.ConfirmButton
                type="button"
                onClick={closeModal}
                disabled={isMutating}
              >
                ì·¨ì†Œ
              </S.ConfirmButton>
              <S.ConfirmDangerButton
                type="button"
                onClick={() => {
                  closeModal();
                  handleDelete(commentId);
                }}
                disabled={isMutating}
              >
                ?? œ
              </S.ConfirmDangerButton>
            </S.ConfirmActions>
          </S.ConfirmBox>
        ),
      });
    },
    [closeModal, handleDelete, isMutating, openModal],
  );

  return (
    <S.CommentSection>
      <S.CommentList>
        {isLoading ? (
          <S.CommentItem>
            <S.CommentMeta>?“ê???ë¶ˆëŸ¬?¤ëŠ” ì¤?..</S.CommentMeta>
          </S.CommentItem>
        ) : null}
        {!isLoading && errorMessage ? (
          <S.CommentItem>
            <S.CommentMeta>{errorMessage}</S.CommentMeta>
          </S.CommentItem>
        ) : null}
        {!isLoading && !errorMessage && comments.length === 0 ? (
          <S.CommentItem>
            <S.CommentMeta>?±ë¡???“ê????†ìŠµ?ˆë‹¤.</S.CommentMeta>
          </S.CommentItem>
        ) : null}
        {!isLoading && !errorMessage
          ? comments.map((comment) => {
              const isExpanded = expandedCommentIds.includes(comment.id);
              const canExpand = overflowCommentIds.includes(comment.id);

              return (
                <S.CommentItem key={comment.id}>
                  <S.CommentMeasure ref={registerCommentMeasure(comment.id)}>
                    {comment.content}
                  </S.CommentMeasure>
                  <S.CommentHeader>
                    <S.CommentMeta>{getCommentMeta(comment)}</S.CommentMeta>
                    {comment.user?.id === userId ? (
                      <S.CommentActions>
                        {editingCommentId === comment.id ? (
                          <>
                            <S.ActionButton
                              type="button"
                              onClick={handleEditSave}
                              disabled={
                                isMutating ||
                                mutatingCommentId === comment.id ||
                                editingValue.trim().length === 0
                              }
                            >
                              {mutatingCommentId === comment.id ? 'Saving...' : 'Save'}
                            </S.ActionButton>
                            <S.ActionButton
                              type="button"
                              onClick={handleEditCancel}
                              disabled={isMutating}
                            >
                              Cancel
                            </S.ActionButton>
                          </>
                        ) : (
                          <>
                            <S.ActionButton
                              type="button"
                              onClick={() => handleEditStart(comment)}
                              disabled={isMutating}
                            >
                              Edit
                            </S.ActionButton>
                            <S.DangerButton
                              type="button"
                              onClick={() => handleDeleteClick(comment.id)}
                              disabled={isMutating}
                            >
                              {mutatingCommentId === comment.id ? 'Deleting...' : 'Delete'}
                            </S.DangerButton>
                          </>
                        )}
                      </S.CommentActions>
                    ) : null}
                  </S.CommentHeader>
                  {editingCommentId === comment.id ? (
                    <S.EditInput
                      value={editingValue}
                      onChange={(event) => setEditingValue(event.target.value)}
                      onKeyDown={handleEditKeyDown}
                      disabled={isMutating || mutatingCommentId === comment.id}
                    />
                  ) : (
                    <>
                      <S.CommentBody
                        ref={registerCommentBody(comment.id)}
                        $isClamped={!isExpanded}
                      >
                        {comment.content}
                      </S.CommentBody>
                      {!isExpanded && canExpand ? (
                        <S.ReadMoreButton
                          type="button"
                          onClick={() => handleExpand(comment.id)}
                        >
                          ?”ë³´ê¸?
                        </S.ReadMoreButton>
                      ) : null}
                    </>
                  )}
                </S.CommentItem>
              );
            })
          : null}
      </S.CommentList>
    </S.CommentSection>
  );
}
