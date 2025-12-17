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

export default function IssueCard() {
  return (
    <Card>
      <Header>
        <Content>강남역 지하철 광고 집행</Content>
        <Meta>
          <AuthorPill>Anna</AuthorPill>
          <IconButton aria-label="comment">
            <img
              src="/comment.svg"
              alt="댓글"
            />
          </IconButton>
        </Meta>
      </Header>
      <Divider />
      <Footer>
        <VoteButton variant="primary">찬성</VoteButton>
        <VoteButton variant="secondary">반대</VoteButton>
      </Footer>
    </Card>
  );
}
