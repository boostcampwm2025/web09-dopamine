'use client';

import * as S from './comment-window.styles';
import { useWindow } from './hooks/use-window';
import { getCommentMeta } from '@/lib/utils/comment';
import { useModalStore } from '@/components/modal/use-modal-store';

export interface CommentWindowProps {
  ideaId: string;
  userId: string;
  initialPosition?: { x: number; y: number };
  onClose?: () => void;
  width?: number | string;
  height?: number | string;
}

export default function CommentWindow({
  ideaId,
  userId,
  initialPosition,
  onClose,
  width = 420,
  height,
}: CommentWindowProps) {
  const {
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
    editingCommentId,
    editingValue,
    setEditingValue,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    handleDelete,
    handleEditKeyDown,
  } = useWindow({ initialPosition, ideaId, userId });
  const { openModal, closeModal } = useModalStore();

  const handleDeleteClick = (commentId: string) => {
    if (isMutating) return;

    openModal({
      title: '댓글 삭제',
      content: (
        <S.ConfirmBox>
          <S.ConfirmMessage>정말 삭제할까요?</S.ConfirmMessage>
          <S.ConfirmActions>
            <S.ConfirmButton type="button" onClick={closeModal} disabled={isMutating}>
              취소
            </S.ConfirmButton>
            <S.ConfirmDangerButton
              type="button"
              onClick={() => {
                closeModal();
                handleDelete(commentId);
              }}
              disabled={isMutating}
            >
              삭제
            </S.ConfirmDangerButton>
          </S.ConfirmActions>
        </S.ConfirmBox>
      ),
    });
  };

  return (
    <S.Window
      role="dialog"
      aria-label="댓글"
      style={{ left: position.x, top: position.y, width, height }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <S.Header>
        <S.Title>댓글</S.Title>
        <S.Controls>
          <S.CloseButton type="button" aria-label="Close" onClick={onClose}>
            &times;
          </S.CloseButton>
        </S.Controls>
      </S.Header>
      <S.Body>
        <S.Section>
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
              ? comments.map((comment) => (
                  <S.CommentItem key={comment.id}>
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
                      <S.CommentBody>{comment.content}</S.CommentBody>
                    )}
                  </S.CommentItem>
                ))
              : null}
          </S.CommentList>
        </S.Section>
        <S.Divider />
        <S.Section>
          <S.InputRow>
            <S.Input
              placeholder="답변"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={isSubmitting}
            />
            <S.SubmitButton type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '제출'}
            </S.SubmitButton>
          </S.InputRow>
        </S.Section>
      </S.Body>
    </S.Window>
  );
}
