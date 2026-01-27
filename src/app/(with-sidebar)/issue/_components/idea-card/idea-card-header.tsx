'use client';

import type { KeyboardEventHandler, MouseEventHandler, RefObject } from 'react';
import Image from 'next/image';
import { ISSUE_STATUS } from '@/constants/issue';
import type { IssueStatus } from '@/types/issue';
import * as S from './idea-card.styles';

interface IdeaCardHeaderProps {
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
  onCommentClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function IdeaCardHeader({
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
  onCommentClick,
}: IdeaCardHeaderProps) {
  return (
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
            onClick={onCommentClick}
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
  );
}
