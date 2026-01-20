'use client';

import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';
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

  return (
    <S.CommentSection>
      <S.CommentList>
        {isLoading ? (
          <S.CommentItem>
            <S.CommentMeta>댓글을 불러오는 중...</S.CommentMeta>
          </S.CommentItem>
        ) : null}
        {!isLoading && errorMessage ? (
          <S.CommentItem>
            <S.CommentMeta>{errorMessage}</S.CommentMeta>
          </S.CommentItem>
        ) : null}
        {!isLoading && !errorMessage && comments.length === 0 ? (
          <S.CommentItem>
            <S.CommentMeta>등록된 댓글이 없습니다.</S.CommentMeta>
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
                            <S.Btn
                              type="button"
                              onClick={handleEditSave}
                              disabled={
                                isMutating ||
                                mutatingCommentId === comment.id ||
                                editingValue.trim().length === 0
                              }
                            >
                              {mutatingCommentId === comment.id ? '저장중...' : '저장'}
                            </S.Btn>
                            <S.Btn
                              type="button"
                              onClick={handleEditCancel}
                              disabled={isMutating}
                            >
                              취소
                            </S.Btn>
                          </>
                        ) : (
                          <>
                            <S.Btn
                              type="button"
                              onClick={() => handleEditStart(comment)}
                              disabled={isMutating}
                            >
                              수정
                            </S.Btn>
                            <S.Btn
                              type="button"
                              onClick={() => handleDeleteClick(comment.id)}
                              disabled={isMutating}
                              $variant="danger"
                            >
                              {mutatingCommentId === comment.id ? '삭제중...' : '삭제'}
                            </S.Btn>
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
                          더보기
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
