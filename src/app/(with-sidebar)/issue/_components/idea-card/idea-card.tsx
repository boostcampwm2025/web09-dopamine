'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import useIdeaCard from '@/app/(with-sidebar)/issue/hooks/use-idea-card';
import { ISSUE_STATUS, VOTE_TYPE } from '@/constants/issue';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { useIdeaQuery } from '../../hooks/queries/use-idea-query';
import { useSelectedIdeaMutation } from '../../hooks/queries/use-selected-idea-mutation';
import { useIssueData } from '../../hooks/use-issue-data';
import { useIdeaCardStackStore } from '../../store/use-idea-card-stack-store';
import type { CardStatus, Position } from '../../types/idea';
import * as S from './idea-card.styles';

interface IdeaCardProps {
  id: string;
  issueId: string;
  content: string;
  author: string;
  userId: string;
  position: Position | null;
  isSelected?: boolean;
  isVoteButtonVisible?: boolean;
  isVoteDisabled?: boolean;
  agreeCount?: number;
  disagreeCount?: number;
  editable?: boolean;
  status?: CardStatus;
  onVoteChange?: (agreeCount: number, disagreeCount: number) => void;
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
  isVoteButtonVisible?: boolean;
  isVoteDisabled?: boolean;
  agreeCount?: number;
  disagreeCount?: number;
  needDiscussion?: boolean;
  editable?: boolean;
};

export default function IdeaCard(props: IdeaCardProps) {
  const issueId = props.issueId ?? '';
  const { mutate: selectIdea } = useSelectedIdeaMutation(issueId);
  const { status: issueStatus } = useIssueData(props.issueId);
  const { bringToFront, getZIndex } = useIdeaCardStackStore(props.issueId);
  const zIndex = props.id ? getZIndex(props.id) : 0;

  // 현재 로그인한 사용자가 이 아이디어의 작성자인지 확인
  const currentUserId = getUserIdForIssue(props.issueId);
  const isCurrentUser = currentUserId === props.userId;

  // 비즈니스 로직 (투표, 편집 등)
  const {
    textareaRef,
    status,
    isEditing,
    editValue,
    displayContent,
    setEditValue,
    handleAgree,
    handleDisagree,
    submitEdit,
    handleKeyDownEdit,
  } = useIdeaCard({
    id: props.id,
    userId: currentUserId,
    content: props.content,
    isSelected: props.isSelected,
    status: props.status,
    editable: !!props.editable,
    onSave: props.onSave,
  });

  const { data: idea } = useIdeaQuery(props.id, currentUserId);

  // 드래그 로직
  const inCategory = !!props.categoryId;

  // dnd-kit useDraggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id || 'idea-unknown',
    disabled: !props.id, // id가 없으면 드래그 불가
    data: {
      editValue: editValue,
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editValue]);

  useEffect(() => {
    // 입력 중인 카드의 드래그가 끝난 경우, textarea에 포커스
    if (isEditing && !isDragging) {
      // dnd-kit에서 드래그가 끝나면 드래그한 컴포넌트를 자동으로 focus하기 때문에 시간차를 두고 포커스 설정
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isDragging]);

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

  const handlePointerDown = (e: React.PointerEvent) => {
    // z-index 업데이트는 드래그 시작 전에 처리
    if (props.id && !inCategory) {
      bringToFront(props.id);
    }

    if (isEditing) {
      textareaRef.current?.focus();
    }

    // listeners의 onPointerDown도 호출 (드래그를 위해)
    if (listeners?.onPointerDown) {
      listeners.onPointerDown(e);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onDelete?.();
  };

  const handleCardClick = () => {
    if (!props.id || !props.categoryId || isEditing || issueStatus !== ISSUE_STATUS.SELECT) {
      return;
    }
    if (props.onClick) {
      props.onClick();
      return;
    }
    selectIdea(props.id);
  };

  return (
    <S.Card
      ref={setNodeRef}
      issueStatus={issueStatus}
      status={status}
      isDragging={isDragging}
      inCategory={inCategory}
      onClick={handleCardClick}
      onPointerDown={handlePointerDown}
      {...attributes}
      {...(inCategory
        ? {}
        : Object.fromEntries(
            Object.entries(listeners || {}).filter(([key]) => key !== 'onPointerDown'),
          ))}
      style={cardStyle}
    >
      <S.Badge status={status}>
        <Image
          src="/crown.svg"
          alt="채택 아이콘"
          width={20}
          height={20}
        />
        <span>채택</span>
      </S.Badge>

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
          <S.AuthorPill isCurrentUser={isCurrentUser}>{props.author}</S.AuthorPill>
          {props.isVoteButtonVisible ? (
            <S.IconButton aria-label="comment">
              <Image
                src="/comment.svg"
                alt="댓글"
                width={14}
                height={14}
              />
            </S.IconButton>
          ) : (
            <>{isEditing ? <S.SubmitButton onClick={submitEdit}>제출</S.SubmitButton> : null}</>
          )}
        </S.Meta>
        {issueStatus === ISSUE_STATUS.BRAINSTORMING && isCurrentUser && (
          <S.DeleteButton
            aria-label="delete"
            onClick={handleDeleteClick}
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
      {props.isVoteButtonVisible && (
        <S.Footer>
          <S.VoteButton
            kind={VOTE_TYPE.AGREE}
            cardStatus={status}
            active={idea?.myVote === VOTE_TYPE.AGREE}
            onClick={handleAgree}
            disabled={props.isVoteDisabled}
          >
            찬성 {idea?.agreeCount}
          </S.VoteButton>
          <S.VoteButton
            kind={VOTE_TYPE.DISAGREE}
            cardStatus={status}
            active={idea?.myVote === VOTE_TYPE.DISAGREE}
            onClick={handleDisagree}
            disabled={props.isVoteDisabled}
          >
            반대 {idea?.disagreeCount}
          </S.VoteButton>
        </S.Footer>
      )}
    </S.Card>
  );
}
