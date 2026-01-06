'use client';

import { useState } from 'react';
import {
  RankBadge,
  HeaderLeft,
  Container,
  Card,
  Header,
  Dot,
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

export default function CategorizedList() {
  const { categorizedCards } = useIssueSummary();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

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
                <Dot></Dot>
                <Title>{category.title}</Title>
              </HeaderLeft>
            </Header>
            {visibleIdeas.map((item, ideaIndex) => (
              <ItemWrapper key={item.id}>
                <ItemLeft>
                  <RankBadge highlighted={ideaIndex === 0}>{ideaIndex + 1}</RankBadge>
                  <ItemContent>{item.content}</ItemContent>
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
                <MoreButton type="button" onClick={() => toggleCategory(category.id)}>
                  {isExpanded ? '접기' : '더보기'}
                </MoreButton>
              </Footer>
            )}
          </Card>
        );
      })}
    </Container>
  );
}
