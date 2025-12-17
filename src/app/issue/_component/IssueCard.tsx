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
} from './IssueCard.style';

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
}

export default function IssueCard(props: IssueCardProps) {
  const [status, setStatus] = useState<'needDiscussion' | 'selected' | 'default'>('default');

  const { needDiscussion = false, isSelected = false } = props;

  const [userVote, setUserVote] = useState<'agree' | 'disagree' | null>(null);
  const [agreeCountState, setAgreeCountState] = useState<number>(props.agreeCount ?? 0);
  const [disagreeCountState, setDisagreeCountState] = useState<number>(props.disagreeCount ?? 0);
  const [isEditing, setIsEditing] = useState<boolean>(!!props.editable);
  const [editValue, setEditValue] = useState<string>(props.content ?? '');
  const [displayContent, setDisplayContent] = useState<string>(props.content ?? '');

  useEffect(() => {
    setEditValue(props.content ?? '');
    setDisplayContent(props.content ?? '');
  }, [props.content]);

  const handleAgree = () => {
    if (userVote === 'agree') {
      setUserVote(null);
      setAgreeCountState((c) => Math.max(0, c - 1));
      return;
    }

    setUserVote('agree');
    setAgreeCountState((c) => c + 1);
    if (userVote === 'disagree') setDisagreeCountState((c) => Math.max(0, c - 1));
  };

  const handleDisagree = () => {
    if (userVote === 'disagree') {
      setUserVote(null);
      setDisagreeCountState((c) => Math.max(0, c - 1));
      return;
    }

    setUserVote('disagree');
    setDisagreeCountState((c) => c + 1);
    if (userVote === 'agree') setAgreeCountState((c) => Math.max(0, c - 1));
  };

  const submitEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    // optimistic update locally
    setDisplayContent(trimmed);
    setIsEditing(false);
    if (props.onSave) props.onSave(trimmed);
  };

  const handleKeyDownEdit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitEdit();
    }
  };

  useEffect(() => {
    if (isSelected) {
      setStatus('selected');
      return;
    }

    if (needDiscussion) {
      setStatus('needDiscussion');
      return;
    }

    setStatus('default');
  }, [isSelected, needDiscussion]);

  return (
    <Card status={status}>
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
          <Content onDoubleClick={() => props.onSave && setIsEditing(true)}>{displayContent}</Content>
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
