'use client';

import { useEffect, useRef, useState } from 'react';
import type { MouseEventHandler, PointerEventHandler } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Portal from '@/components/portal/portal';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { useIdeaQuery, useIssueData, useSelectedIdeaMutation } from '../../hooks';
import { useIdeaCardStackStore } from '../../store/use-idea-card-stack-store';
import type { CardStatus, Position } from '../../types/idea';
import { useCanvasContext } from '../canvas/canvas-context';
import CommentWindow from '../comment-window/comment-window';
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
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const commentButtonRef = useRef<HTMLButtonElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const { scale } = useCanvasContext();
  const normalizedScale = scale || 1;

  // 댓글 버튼 위치 업데이트 함수
  const updateCommentPosition = () => {
    if (!commentButtonRef.current) return;

    const buttonRect = commentButtonRef.current.getBoundingClientRect();
    setCommentPosition({
      x: buttonRect.right + 8,
      y: buttonRect.top,
    });
  };

  const handleOpenComment: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    commentButtonRef.current = event.currentTarget;
    const nextOpen = !isCommentOpen;

    if (nextOpen) {
      updateCommentPosition();
    }

    setIsCommentOpen(nextOpen);
  };

  // 댓글창이 열려있을 때 아이디어 카드 위치 변화 감지
  useEffect(() => {
    if (!isCommentOpen || !commentButtonRef.current) return;

    // 초기 위치 설정
    updateCommentPosition();

    // ResizeObserver로 뷰포트 크기 변화 감지
    const resizeObserver = new ResizeObserver(() => {
      updateCommentPosition();
    });
    resizeObserver.observe(document.body);

    // 스크롤 이벤트 감지
    const handleScroll = () => updateCommentPosition();
    window.addEventListener('scroll', handleScroll, true);

    // MutationObserver로 DOM 변화 감지 (카테고리 이동, 아이디어 이동 등)
    const mutationObserver = new MutationObserver(() => {
      updateCommentPosition();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // 주기적으로 위치 체크 (드래그 중 등)
    const intervalId = setInterval(updateCommentPosition, 50);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('scroll', handleScroll, true);
      clearInterval(intervalId);
    };
  }, [isCommentOpen]);

  // setNodeRef와 cardRef를 함께 사용
  const combinedRef = (node: HTMLElement | null) => {
    setNodeRef(node);
    cardRef.current = node;
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
        isEditing={isEditing}
        editValue={editValue}
        displayContent={displayContent}
        isVoteButtonVisible={props.isVoteButtonVisible}
        isCurrentUser={isCurrentUser}
        author={props.author}
        issueStatus={issueStatus}
        commentCount={idea?.comments?.length ?? 0}
        textareaRef={textareaRef}
        setEditValue={setEditValue}
        handleKeyDownEdit={handleKeyDownEdit}
        submitEdit={submitEdit}
        onDelete={handleDeleteClick}
        onCommentClick={handleOpenComment}
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
      {isCommentOpen && commentPosition && (
        <Portal>
          <CommentWindow
            issueId={props.issueId}
            ideaId={props.id}
            userId={currentUserId}
            initialPosition={commentPosition}
            scale={normalizedScale}
            onClose={() => setIsCommentOpen(false)}
          />
        </Portal>
      )}
    </S.Card>
  );
}
