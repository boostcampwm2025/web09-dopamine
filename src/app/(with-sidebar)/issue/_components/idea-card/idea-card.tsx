'use client';

import { useEffect, useRef } from 'react';
import type { PointerEventHandler } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import useIdeaCard from '@/app/(with-sidebar)/issue/hooks/use-idea-card';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { useIdeaQuery } from '../../hooks/react-query/use-idea-query';
import { useSelectedIdeaMutation } from '../../hooks/react-query/use-selected-idea-mutation';
import { useIssueData } from '../../hooks/use-issue-data';
import { useIdeaCardStackStore } from '../../store/use-idea-card-stack-store';
import type { CardStatus, Position } from '../../types/idea';
import IdeaCardBadge from './idea-card-badge';
import IdeaCardFooter from './idea-card-footer';
import IdeaCardHeader from './idea-card-header';
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
  const inCategory = !!props.categoryId;
  const listenersRef = useRef<{ onPointerDown?: PointerEventHandler } | null>(null);
  const getListeners = () => listenersRef.current ?? undefined;

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
    handlePointerDown,
    handleDeleteClick,
    handleCardClick,
  } = useIdeaCard({
    id: props.id,
    userId: currentUserId,
    content: props.content,
    isSelected: props.isSelected,
    status: props.status,
    editable: !!props.editable,
    onSave: props.onSave,
    categoryId: props.categoryId,
    inCategory,
    issueStatus,
    bringToFront,
    getListeners,
    onDelete: props.onDelete,
    onClick: props.onClick,
    selectIdea,
  });

  const { data: idea } = useIdeaQuery(props.id, currentUserId);

  // 드래그 로직

  // dnd-kit useDraggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id || 'idea-unknown',
    disabled: !props.id, // id가 없으면 드래그 불가
    data: {
      editValue: editValue,
    },
  });

  useEffect(() => {
    listenersRef.current = listeners || null;
  }, [listeners]);

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

  return (
    <S.Card
      ref={setNodeRef}
      data-idea-card={props.id}
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
      <IdeaCardBadge status={status} />
      <IdeaCardHeader
        isEditing={isEditing}
        editValue={editValue}
        displayContent={displayContent}
        isVoteButtonVisible={props.isVoteButtonVisible}
        isCurrentUser={isCurrentUser}
        author={props.author}
        issueStatus={issueStatus}
        textareaRef={textareaRef}
        setEditValue={setEditValue}
        handleKeyDownEdit={handleKeyDownEdit}
        submitEdit={submitEdit}
        onDelete={handleDeleteClick}
      />
      <IdeaCardFooter
        isVoteButtonVisible={props.isVoteButtonVisible}
        status={status}
        myVote={idea?.myVote}
        agreeCount={idea?.agreeCount}
        disagreeCount={idea?.disagreeCount}
        isVoteDisabled={props.isVoteDisabled}
        onAgree={handleAgree}
        onDisagree={handleDisagree}
      />
    </S.Card>
  );
}
