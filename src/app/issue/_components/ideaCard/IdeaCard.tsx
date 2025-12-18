'use client';

import Image from 'next/image';
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
} from './IdeaCard.style';
import useIdeaCard from './useIdeaCard';
import { useDraggable } from '../../hooks/useDraggable';
import { useCanvasContext } from '../canvas/CanvasContext';
import type { Position } from '../../types/idea';

interface IdeaCardProps {
  id?: string;
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

  // 드래그 로직
  const inCategory = !!props.categoryId;
  const canDrag = !inCategory && props.position && props.id && props.onPositionChange;

  const draggable = canDrag
    ? useDraggable({
        initialPosition: props.position!,
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
  const cardStyle = props.position
    ? {
        position: 'absolute' as const,
        left: draggable ? draggable.position.x : props.position.x,
        top: draggable ? draggable.position.y : props.position.y,
        cursor: draggable?.isDragging ? 'grabbing' : canDrag ? 'grab' : 'default',
        userSelect: 'none' as const,
        zIndex: draggable?.isDragging ? 1000 : 1,
      }
    : undefined;

  return (
    <Card
      status={status}
      isDragging={draggable?.isDragging ?? false}
      onClick={props.onClick}
      onMouseDown={draggable?.handleMouseDown}
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
            <IconButton aria-label="delete">
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
