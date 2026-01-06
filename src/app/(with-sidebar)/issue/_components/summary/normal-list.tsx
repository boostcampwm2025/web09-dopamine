'use client';

import { useState } from 'react';
import type { Idea } from '@/app/(with-sidebar)/issue/types/idea';
import Image from 'next/image';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogHeader,
  DialogOverlay,
} from './dialog.styles';
import {
  Container,
  Item,
  ItemLeft,
  ItemRight,
  RankBadge,
  Content,
  Title,
  MetaRow,
  Author,
  Divider,
  VoteInfoSection,
  VoteInfo,
  VoteLabel,
  VoteCount,
  Footer,
  MoreButton,
} from './normal-list.styles';
import { mockIdeas } from '../../data/mock-ideas';

const rawData: Idea[] = mockIdeas;
export default function NormalList() {
  const [showAll, setShowAll] = useState(false);
  const [dialogContent, setDialogContent] = useState<string | null>(null);

  const visibleItems = showAll ? rawData : rawData.slice(0, 5);
  const hasMore = rawData.length > 5;

  return (
    <Container>
      {visibleItems.map((item, index) => (
        <Item key={item.id} highlighted={item.highlighted}>
          <ItemLeft>
            <RankBadge highlighted={item.highlighted}>{index + 1}</RankBadge>
            <Content>
              <Title
                title={item.content}
                role="button"
                tabIndex={0}
                onClick={() => setDialogContent(item.content)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setDialogContent(item.content);
                  }
                }}
              >
                {item.content}
              </Title>
              <MetaRow>
                <Author>{item.author}</Author>
                <Divider />
                <span>{item.category}</span>
              </MetaRow>
            </Content>
          </ItemLeft>
          <ItemRight>
            <VoteInfoSection>
              <VoteInfo type="agree">
                <VoteLabel>찬성</VoteLabel>
                <VoteCount type="agree">{item.agreeCount}</VoteCount>
              </VoteInfo>
              <VoteInfo type="disagree">
                <VoteLabel>반대</VoteLabel>
                <VoteCount type="disagree">{item.disagreeCount}</VoteCount>
              </VoteInfo>
            </VoteInfoSection>
          </ItemRight>
        </Item>
      ))}
      {hasMore && (
        <Footer>
          <MoreButton type="button" onClick={() => setShowAll((prev) => !prev)}>
            {showAll ? '접기' : '더보기'}
          </MoreButton>
        </Footer>
      )}
      {dialogContent && (
        <DialogOverlay onClick={() => setDialogContent(null)}>
          <Dialog
            role="dialog"
            aria-modal="true"
            aria-label="아이디어 상세"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <span>아이디어 상세</span>
              <DialogClose
                type="button"
                aria-label="닫기"
                onClick={() => setDialogContent(null)}
              >
                <Image
                  src="/close.svg"
                  alt="닫기 이미지"
                  width={16}
                  height={16}
                />  
              </DialogClose>
            </DialogHeader>
            <DialogBody>{dialogContent}</DialogBody>
          </Dialog>
        </DialogOverlay>
      )}
    </Container>
  );
}
