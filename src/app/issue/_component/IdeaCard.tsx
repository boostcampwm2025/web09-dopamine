'use client';

import { useEffect, useState } from 'react';
import {
  AuthorPill,
  Badge,
  Card,
  Content,
  EditableInput,
  Divider,
  Footer,
  Header,
  IconButton,
  Meta,
  VoteButton,
} from './IdeaCard.style';
import useIssueCard from './useIdeaCard';

interface IssueCardProps {
  content?: string;
  author?: string;
  isSelected?: boolean;
  isVotePhrase?: boolean;
  agreeCount?: number;
  disagreeCount?: number;
  needDiscussion?: boolean;
  editable?: boolean;
  onSave?: (content: string) => void;
  onClick?: () => void;
}

export default function IdeaCard(props: IssueCardProps) {
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
  } = useIssueCard({
    content: props.content,
    agreeCount: props.agreeCount,
    disagreeCount: props.disagreeCount,
    isSelected: props.isSelected,
    needDiscussion: props.needDiscussion,
    editable: !!props.editable,
    onSave: props.onSave,
  });


  return (
    <Card status={status} onClick={props.onClick}>
      {status === 'selected' && (
        <Badge>
          <img
            src="/crown.svg"
            alt="채택 아이콘"
            height={"20px"}
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
              <img
                src="/comment.svg"
                alt="댓글"
              />
            </IconButton>
          ) : (
            <IconButton aria-label="delete">
              <img
                src="/trash.svg"
                alt="삭제"
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
