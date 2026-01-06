'use client';

import { useState } from 'react';
import {
  RankBadge,
  HeaderLeft,
  Container,
  Card,
  Header,
  Title,
  ItemWrapper,
  ItemContent,
  ItemLeft,
  VoteInfoSection,
  VoteInfo,
  VoteLabel,
  VoteCount,
  Footer,
  MoreButton,
} from './categorized-list.styles';
import useIssueSummary from '@/app/(with-sidebar)/issue/hooks/use-issue-summary';
import {
  Dialog,
  DialogOverlay,
  DialogHeader,
  DialogBody,
  DialogClose,
} from './dialog.styles';
export default function CategorizedList() {
  const { categorizedCards } = useIssueSummary();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [dialogContent, setDialogContent] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleShowDetail = (text: string) => {
    setDialogContent(text);
  };

  const handleCloseDialog = () => {
    setDialogContent(null);
  };

  const handleContentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleToggleCategory = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { id } = e.currentTarget.dataset;
    if (id) toggleCategory(id);
  }

  return (
    <Container>
      {categorizedCards.map(({ category, ideas }) => {
        const isExpanded = expandedCategories[category.id] ?? false;
        const visibleIdeas = isExpanded ? ideas : ideas.slice(0, 3);
        const hasMore = ideas.length > 3;

        return (
          <Card
            key={category.id}
            id={category.id}
            title={category.title}
          >
            <Header>
              <HeaderLeft>
                <Title>{category.title}</Title>
              </HeaderLeft>
            </Header>
            {visibleIdeas.map((item, ideaIndex) => (
              <ItemWrapper key={item.id}>
                <ItemLeft>
                  <RankBadge highlighted={ideaIndex === 0}>{ideaIndex + 1}</RankBadge>
                  <ItemContent
                    title={item.content}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleShowDetail(item.content)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleShowDetail(item.content);
                      }
                    }}
                  >
                    {item.content}
                  </ItemContent>
                </ItemLeft>
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
              </ItemWrapper>
            ))}
            {hasMore && (
              <Footer>
                <MoreButton type="button" onClick={handleToggleCategory}>
                  {isExpanded ? '접기' : '더보기'}
                </MoreButton>
              </Footer>
            )}
          </Card>
        );
      })}
      {dialogContent && (
        <DialogOverlay onClick={handleCloseDialog}>
          <Dialog
            role="dialog"
            aria-modal="true"
            aria-label="아이디어 상세"
            onClick={handleContentsClick}
          >
            <DialogHeader>
              <span>아이디어 상세</span>
              <DialogClose
                type="button"
                aria-label="닫기"
                onClick={handleCloseDialog}
              >
              </DialogClose>
            </DialogHeader>
            <DialogBody>{dialogContent}</DialogBody>
          </Dialog>
        </DialogOverlay>
      )}
    </Container>
  );
}
