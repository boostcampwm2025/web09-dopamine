'use client';

import {
  AuthorPill,
  Card,
  Content,
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
}

export default function IssueCard(props: IssueCardProps) {
  return (
    <Card>
      <Header>
        <Content>{props.content}</Content>
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
            <VoteButton variant="primary">찬성 {props.agreeCount}</VoteButton>
            <VoteButton variant="secondary">반대 {props.disagreeCount}</VoteButton>
          </Footer>
        </div>
      )}
    </Card>
  );
}
