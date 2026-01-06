'use client';

import Image from 'next/image';
import useIdeaCard from '@/app/(with-sidebar)/issue/hooks/use-idea-card';
import { useDraggable } from '../../hooks/use-draggable';
import { useIdeaCardStackStore } from '../../store/use-idea-card-stack-store';
import type { Position } from '../../types/idea';
import { useCanvasContext } from '../canvas/canvas-context';
import {
  AuthorPill,
  Badge,
  Card,
  Content,
  Divider,
  EditableInput,
  Footer,
  Header,
  IconButton,
  Meta,
  VoteButton,
} from './idea-card.styles';

interface IdeaCardProps {
  id?: string;
  issueId?: string;
  content?: string;
  author?: string;
  position?: Position | null;
  isSelected?: boolean;
  isVotePhrase?: boolean;
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
  isVotePhrase?: boolean;
  agreeCount?: number;
  disagreeCount?: number;
  needDiscussion?: boolean;
  editable?: boolean;
};

export default function IdeaCard(props: IdeaCardProps) {
  const { scale } = useCanvasContext();

  const { bringToFront, getZIndex } = useIdeaCardStackStore(props.issueId);
  const zIndex = props.id ? getZIndex(props.id) : 0;

  // 드래그 로직
  const inCategory = !!props.categoryId;
  // 카테고리에 속하지 않은 자유 배치 아이디어만 드래그 가능
  const canDrag = !inCategory && props.id && props.onPositionChange;

  const draggable =
    canDrag && props.position
      ? useDraggable({
          initialPosition: props.position,
          scale,
          onDragEnd: (newPosition) => {
            if (props.id && props.onPositionChange) {
              props.onPositionChange(props.id, newPosition);
            }
          },
        })
      : null;

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

  // 스타일 계산
  // 자유 배치 모드(categoryId === null)면 absolute positioning
  const cardStyle =
    !inCategory && draggable
      ? {
          position: 'absolute' as const,
          left: draggable.position.x,
          top: draggable.position.y,
          cursor: draggable.isDragging ? 'grabbing' : 'grab',
          userSelect: 'none' as const,
          zIndex: draggable.isDragging ? 1000 : zIndex,
          // 드래그 중에도 Canvas scale 0.7 유지
          transform: draggable.isDragging ? 'scale(0.7)' : undefined,
          transformOrigin: 'top left',
          boxShadow: draggable.isDragging ? '0 12px 24px rgba(31, 41, 55, 0.2)' : undefined,
          opacity: draggable.isDragging ? 0.95 : undefined,
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
    if (!draggable?.hasMoved) {
      props.onDelete?.();
    }
  };

  // HTML5 드래그앤드롭 (카테고리 간 이동용)
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation(); // 카테고리로 이벤트 버블링 방지
    if (props.id) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('ideaId', props.id);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation(); // 드래그 종료 이벤트도 버블링 방지
  };

  return (
    <Card
      status={status}
      isDragging={draggable?.isDragging ?? false}
      inCategory={inCategory}
      onClick={handleCardClick}
      onMouseDown={draggable?.handleMouseDown}
      draggable={inCategory} // 카테고리 내부일 때만 HTML5 드래그 활성화
      onDragStart={inCategory ? handleDragStart : undefined}
      onDragEnd={inCategory ? handleDragEnd : undefined}
      style={cardStyle}
    >
      {status === 'selected' && (
        <Badge>
          <Image
            src="/crown.svg"
            alt="채택 아이콘"
            width={20}
            height={20}
          />
          <span>채택</span>
        </Badge>
      )}
      <Header>
        {isEditing ? (
          <EditableInput
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDownEdit}
            onMouseDown={(e) => e.stopPropagation()}
            autoFocus
            placeholder="아이디어를 입력해주세요."
          />
        ) : (
          <Content>{displayContent}</Content>
        )}
        <Meta>
          <AuthorPill>{props.author}</AuthorPill>
          {props.isVotePhrase ? (
            <IconButton aria-label="comment">
              <Image
                src="/comment.svg"
                alt="댓글"
                width={14}
                height={14}
              />
            </IconButton>
          ) : (
            <IconButton
              aria-label="delete"
              onClick={handleDeleteClick}
            >
              <Image
                src="/trash.svg"
                alt="삭제"
                width={14}
                height={14}
              />
            </IconButton>
          )}
        </Meta>
      </Header>
      {props.isVotePhrase && (
        <div>
          <Divider />
          <Footer>
            <VoteButton
              kind="agree"
              cardStatus={status}
              active={userVote === 'agree'}
              onClick={handleAgree}
            >
              찬성 {agreeCountState}
            </VoteButton>
            <VoteButton
              kind="disagree"
              cardStatus={status}
              active={userVote === 'disagree'}
              onClick={handleDisagree}
            >
              반대 {disagreeCountState}
            </VoteButton>
          </Footer>
        </div>
      )}
    </Card>
  );
}
