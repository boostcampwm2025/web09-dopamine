'use client';

import CommentList from './comment-list';
import * as S from './comment-window.styles';
import { useWindow } from './hooks/use-window';

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

  return (
    <S.Window
      role="dialog"
      aria-label="?“ê?"
      style={{ left: position.x, top: position.y, width, height }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <S.Header>
        <S.Title>?“ê?</S.Title>
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
        <CommentList
          comments={comments}
          isLoading={isLoading}
          errorMessage={errorMessage}
          userId={userId}
          isMutating={isMutating}
          mutatingCommentId={mutatingCommentId}
          editingCommentId={editingCommentId}
          editingValue={editingValue}
          setEditingValue={setEditingValue}
          handleEditStart={handleEditStart}
          handleEditCancel={handleEditCancel}
          handleEditSave={handleEditSave}
          handleEditKeyDown={handleEditKeyDown}
          handleDelete={handleDelete}
        />
        <S.Section>
          <S.InputRow>
            <S.Input
              placeholder="?µë?"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={isSubmitting}
            />
            <S.SubmitButton
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '?±ë¡ ì¤?..' : '?œì¶œ'}
            </S.SubmitButton>
          </S.InputRow>
        </S.Section>
      </S.Body>
    </S.Window>
  );
}
