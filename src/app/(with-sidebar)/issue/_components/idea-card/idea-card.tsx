'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import useIdeaCard from '@/app/(with-sidebar)/issue/hooks/use-idea-card';
import { useIdeaCardStackStore } from '../../store/use-idea-card-stack-store';
import type { Position } from '../../types/idea';
import * as S from './idea-card.styles';

interface IdeaCardProps {
  id?: string;
  issueId?: string;
  content?: string;
  author?: string;
  position?: Position | null;
  isSelected?: boolean;
  isVotePhase?: boolean;
  agreeCount?: number;
  disagreeCount?: number;
  needDiscussion?: boolean;
  editable?: boolean;
  categoryId?: string | null;
  onSave?: (content: string) => void;
  onDelete?: () => void;
  onClick?: () => void;
  onPositionChange?: (id: string, position: Position) => void;
}

export type DragItemPayload = {
  id: string;
  fromColumn: string;
  content?: string;
  author?: string;
  isSelected?: boolean;
  isVotePhase?: boolean;
  agreeCount?: number;
  disagreeCount?: number;
  needDiscussion?: boolean;
  editable?: boolean;
};

export default function IdeaCard(props: IdeaCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { bringToFront, getZIndex } = useIdeaCardStackStore(props.issueId);
  const zIndex = props.id ? getZIndex(props.id) : 0;

  // 드래그 로직
  const inCategory = !!props.categoryId;

  // dnd-kit useDraggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id || 'idea-unknown',
    disabled: !props.id, // id가 없으면 드래그 불가
  });

  // 비즈니스 로직 (투표, 편집 등)
  const {
    status,
    userVote,
    agreeCountState,
    disagreeCountState,
    isEditing,
    editValue,
    displayContent,
    setEditValue,
    handleAgree,
    handleDisagree,
    submitEdit,
    handleKeyDownEdit,
  } = useIdeaCard({
    content: props.content,
    agreeCount: props.agreeCount,
    disagreeCount: props.disagreeCount,
    isSelected: props.isSelected,
    needDiscussion: props.needDiscussion,
    editable: !!props.editable,
    onSave: props.onSave,
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editValue]);

  // 스타일 계산
  // 자유 배치 모드(categoryId === null)면 absolute positioning
  const cardStyle =
    !inCategory && props.position
      ? {
          position: 'absolute' as const,
          left: props.position.x,
          top: props.position.y,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none' as const,
          zIndex: isDragging ? 1000 : zIndex,
          // dnd-kit transform 적용 (Canvas scale과 호환됨!)
          transform: CSS.Transform.toString(transform),
          opacity: isDragging ? 0 : undefined,
        }
      : {};

  const handleCardClick = (e: React.MouseEvent) => {
    if (props.id && !inCategory) {
      bringToFront(props.id);
    }
    props.onClick?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onDelete?.();
  };

  return (
    <S.Card
      ref={setNodeRef}
      status={status}
      isDragging={isDragging}
      inCategory={inCategory}
      onClick={handleCardClick}
      {...attributes}
      {...listeners}
      style={cardStyle}
    >
      {status === 'selected' && (
        <S.Badge>
          <Image
            src="/crown.svg"
            alt="채택 아이콘"
            width={20}
            height={20}
          />
          <span>채택</span>
        </S.Badge>
      )}
      <S.Header>
        {isEditing ? (
          <S.EditableInput
            ref={textareaRef}
            rows={1}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDownEdit}
            onMouseDown={(e) => e.stopPropagation()}
            autoFocus
            placeholder="아이디어를 입력해주세요."
          />
        ) : (
          <S.Content>{displayContent}</S.Content>
        )}
        <S.Meta>
          <S.AuthorPill>{props.author}</S.AuthorPill>
          {props.isVotePhase ? (
            <S.IconButton aria-label="comment">
              <Image
                src="/comment.svg"
                alt="댓글"
                width={14}
                height={14}
              />
            </S.IconButton>
          ) : (
            <>
              {isEditing ? <S.SubmitButton onClick={submitEdit}>제출</S.SubmitButton> : null}
              <S.IconButton
                aria-label="delete"
                onClick={handleDeleteClick}
              >
                <Image
                  src="/trash.svg"
                  alt="삭제"
                  width={14}
                  height={14}
                />
              </S.IconButton>
            </>
          )}
        </S.Meta>
      </S.Header>
      {props.isVotePhase && (
        <div>
          <S.Divider />
          <S.Footer>
            <S.VoteButton
              kind="agree"
              cardStatus={status}
              active={userVote === 'agree'}
              onClick={handleAgree}
            >
              찬성 {agreeCountState}
            </S.VoteButton>
            <S.VoteButton
              kind="disagree"
              cardStatus={status}
              active={userVote === 'disagree'}
              onClick={handleDisagree}
            >
              반대 {disagreeCountState}
            </S.VoteButton>
          </S.Footer>
        </div>
      )}
    </S.Card>
  );
}
