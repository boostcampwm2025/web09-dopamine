'use client';

import { AuthorPill, Card, Content, Divider, Header, IconButton, Meta } from './IssueCard.style';

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
    </Card>
  );
}
