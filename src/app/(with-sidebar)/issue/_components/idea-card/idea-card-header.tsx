'use client';

import { useState } from 'react';
import type { KeyboardEventHandler, MouseEventHandler, RefObject } from 'react';
import Image from 'next/image';
import { ISSUE_STATUS } from '@/constants/issue';
import type { IssueStatus } from '@/types/issue';
import { useCanvasContext } from '../canvas/canvas-context';
import CommentWindow from '../comment-window/comment-window';
import * as S from './idea-card.styles';

interface IdeaCardHeaderProps {
  issueId: string;
  ideaId: string;
  userId: string;
  isEditing: boolean;
  editValue: string;
  displayContent: string;
  isVoteButtonVisible?: boolean;
  isCurrentUser: boolean;
  author: string;
  issueStatus?: IssueStatus;
  commentCount?: number;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  setEditValue: (value: string) => void;
  handleKeyDownEdit: KeyboardEventHandler<HTMLTextAreaElement>;
  submitEdit: () => void;
  onDelete?: MouseEventHandler<HTMLButtonElement>;
}

export default function IdeaCardHeader({
  issueId,
  ideaId,
  userId,
  isEditing,
  editValue,
  displayContent,
  isVoteButtonVisible,
  isCurrentUser,
  author,
  issueStatus,
  commentCount = 0,
  textareaRef,
  setEditValue,
  handleKeyDownEdit,
  submitEdit,
  onDelete,
}: IdeaCardHeaderProps) {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const { scale } = useCanvasContext();
  const normalizedScale = scale || 1;

  const handleOpenComment: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    const target = event.currentTarget;
    const nextOpen = !isCommentOpen;

    if (nextOpen) {
      const card = target.closest('[data-idea-card]') as HTMLElement | null;
      const targetRect = target.getBoundingClientRect();
      if (card) {
        const cardRect = card.getBoundingClientRect();
        setCommentPosition({
          x: (targetRect.left - cardRect.left) / normalizedScale,
          y: (targetRect.bottom - cardRect.top + 8) / normalizedScale,
        });
      } else {
        setCommentPosition({
          x: 0,
          y: (targetRect.height + 8) / normalizedScale,
        });
      }
    }

    setIsCommentOpen(nextOpen);
  };

  return (
    <>
      <S.Header>
        {isEditing ? (
          <S.EditableInput
            ref={textareaRef}
            rows={1}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDownEdit}
            onMouseDown={(e) => e.stopPropagation()}
            autoFocus
            placeholder="아이디어를 입력해주세요."
          />
        ) : (
          <S.Content>{displayContent}</S.Content>
        )}
        <S.Meta>
          <S.AuthorPill isCurrentUser={isCurrentUser}>{author}</S.AuthorPill>
          {isVoteButtonVisible ? (
            <S.IconButton
              aria-label="comment"
              onClick={handleOpenComment}
            >
              <Image
                src="/comment.svg"
                alt="댓글"
                width={14}
                height={14}
              />
              <S.CommentCount>{commentCount}</S.CommentCount>
            </S.IconButton>
          ) : (
            <>{isEditing ? <S.SubmitButton onClick={submitEdit}>제출</S.SubmitButton> : null}</>
          )}
        </S.Meta>
        {issueStatus === ISSUE_STATUS.BRAINSTORMING && isCurrentUser && (
          <S.DeleteButton
            aria-label="delete"
            onClick={onDelete}
          >
            <Image
              src="/close.svg"
              alt="삭제"
              width={14}
              height={14}
            />
          </S.DeleteButton>
        )}
      </S.Header>
      {isCommentOpen ? (
        <CommentWindow
          issueId={issueId}
          ideaId={ideaId}
          userId={userId}
          initialPosition={commentPosition ?? undefined}
          onClose={() => setIsCommentOpen(false)}
        />
      ) : null}
    </>
  );
}
