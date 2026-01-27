'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { MouseEventHandler, PointerEventHandler } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useIdeaQuery, useSelectedIdeaMutation } from '@/hooks/issue';
import { useIssueData, useIssueIdentity } from '../../hooks';
import { useCommentWindowStore } from '../../store/use-comment-window-store';
import { useIdeaCardStackStore } from '../../store/use-idea-card-stack-store';
import type { CardStatus, Position } from '../../types/idea';
import CommentWindow from '../comment/comment-window';
import IdeaCardBadge from './idea-card-badge';
import IdeaCardFooter from './idea-card-footer';
import IdeaCardHeader from './idea-card-header';
import * as S from './idea-card.styles';
import { useIdeaCard } from './use-idea-card';

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
  isHotIdea?: boolean;
  onVoteChange?: (agreeCount: number, disagreeCount: number) => void;
  categoryId?: string | null;
  onSave?: (content: string) => void;
  onDelete?: () => void;
  onClick?: () => void;
  onPositionChange?: (id: string, position: Position) => void;
  disableAnimation?: boolean; // 드래그 중일 때는 애니메이션 비활성화
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
  const { status: issueStatus, isQuickIssue } = useIssueData(props.issueId);
  const { bringToFront, getZIndex } = useIdeaCardStackStore(props.issueId);
  const zIndex = props.id ? getZIndex(props.id) : 0;

  // 현재 사용자가 이 아이디어의 작성자인지 확인
  const { userId: currentUserId } = useIssueIdentity(props.issueId, { isQuickIssue });
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
    issueId: props.issueId,
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

  const { data: idea } = useIdeaQuery(props.issueId, props.id, currentUserId);

  // 댓글 윈도우 상태 관리
  const activeCommentId = useCommentWindowStore((s) => s.activeCommentId);
  const openComment = useCommentWindowStore((s) => s.openComment);
  const closeComment = useCommentWindowStore((s) => s.closeComment);
  const isCommentOpen = activeCommentId === props.id;

  const handleToggleComment: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();

    // 토글: 같은 카드의 댓글창이면 닫고, 다른 카드면 전환
    if (activeCommentId === props.id) {
      closeComment();
      return;
    }

    openComment(props.id);
  };

  // 드래그 로직

  // dnd-kit useDraggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id || 'idea-unknown',
    disabled: !props.id, // id가 없으면 드래그 불가
    data: {
      editValue: editValue,
    },
  });

  const cardRef = useRef<HTMLElement | null>(null);

  // setNodeRef와 cardRef를 함께 사용
  const combinedRef = useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node);
      cardRef.current = node;
    },
    [setNodeRef],
  );

  useEffect(() => {
    listenersRef.current = listeners || null;
  }, [listeners]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editValue, textareaRef]);

  useEffect(() => {
    // 입력 중인 카드의 드래그가 끝난 경우, textarea에 포커스
    if (isEditing && !isDragging) {
      // dnd-kit에서 드래그가 끝나면 드래그한 컴포넌트를 자동으로 focus하기 때문에 시간차를 두고 포커스 설정
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isDragging, isEditing, textareaRef]);

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
        // 브로드캐스팅으로 다른 사용자 이동 시 애니메이션
        transition: props.disableAnimation ? 'none' : 'left 0.4s ease-out, top 0.4s ease-out',
      }
      : {};

  return (
    <S.Card
      ref={combinedRef}
      data-idea-card={props.id}
      issueStatus={issueStatus}
      status={status}
      isDragging={isDragging}
      inCategory={inCategory}
      isCommentOpen={isCommentOpen}
      isHotIdea={props.isHotIdea}
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
      <IdeaCardBadge
        status={status}
        isHotIdea={props.isHotIdea}
      />
      <IdeaCardHeader
        id={props.id}
        issueId={props.issueId}
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
        onCommentClick={handleToggleComment}
      />
      <IdeaCardFooter
        isVoteButtonVisible={props.isVoteButtonVisible}
        status={status}
        myVote={idea?.myVote ?? undefined}
        agreeCount={idea?.agreeCount}
        disagreeCount={idea?.disagreeCount}
        isVoteDisabled={props.isVoteDisabled}
        onAgree={handleAgree}
        onDisagree={handleDisagree}
      />
      {isCommentOpen && !isDragging && (
        <CommentWindow
          issueId={issueId}
          ideaId={props.id}
          userId={currentUserId}
          onClose={closeComment}
        />
      )}
    </S.Card>
  );
}
