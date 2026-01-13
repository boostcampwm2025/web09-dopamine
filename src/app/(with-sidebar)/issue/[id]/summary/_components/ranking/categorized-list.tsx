'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { getCategorizedIdeas } from '@/app/(with-sidebar)/issue/services/issue-service';
import type { Category } from '@/app/(with-sidebar)/issue/types/category';
import type { Idea } from '@/app/(with-sidebar)/issue/types/idea';
import { VOTE_TYPE } from '@/constants/issue';
import * as S from './categorized-list.styles';
import * as DS from './dialog.styles';

type CategorizedCard = {
  category: Category;
  ideas: Idea[];
};

export default function CategorizedList() {
  const [categorizedCards, setCategorizedCards] = useState<CategorizedCard[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [dialogContent, setDialogContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      const { categorizedCards: fetchedCards } = await getCategorizedIdeas();
      setCategorizedCards(fetchedCards);
    };

    fetchIssues();
  }, []);

  const columns = useMemo(
    () =>
      categorizedCards.reduce<[CategorizedCard[], CategorizedCard[]]>(
        (acc, card, index) => {
          acc[index % 2].push(card);
          return acc;
        },
        [[], []],
      ),
    [categorizedCards],
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleShowDetail = (text: string) => {
    setDialogContent(text);
  };

  const handleItemInteraction = (e: React.MouseEvent | React.KeyboardEvent) => {
    // 키보드 체크
    if ('key' in e && e.key !== 'Enter' && e.key !== ' ') return;

    // 데이터 추출
    const content = e.currentTarget.getAttribute('data-content');
    if (content) {
      if ('key' in e) e.preventDefault();
      handleShowDetail(content);
    }
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
  };

  return (
    <S.Container>
      {columns.map((colCards, colIndex) => (
        <S.ContainerCol key={`col-${colIndex}`}>
          {colCards.map(({ category, ideas }) => {
            const isExpanded = expandedCategories[category.id] ?? false;
            const visibleIdeas = isExpanded ? ideas : ideas.slice(0, 3);
            const hasMore = ideas.length > 3;

            return (
              <S.Card
                key={category.id}
                id={category.id}
                title={category.title}
              >
                <S.Header>
                  <S.HeaderLeft>
                    <S.Title>{category.title}</S.Title>
                  </S.HeaderLeft>
                </S.Header>
                {visibleIdeas.map((item, ideaIndex) => (
                  <S.ItemWrapper key={item.id}>
                    <S.ItemLeft>
                      <S.RankBadge highlighted={ideaIndex === 0}>{ideaIndex + 1}</S.RankBadge>
                      <S.ItemContent
                        title={item.content}
                        role="button"
                        tabIndex={0}
                        data-content={item.content}
                        onClick={handleItemInteraction}
                        onKeyDown={handleItemInteraction}
                      >
                        {item.content}
                      </S.ItemContent>
                    </S.ItemLeft>
                    <S.VoteInfoSection>
                      <S.VoteInfo type={VOTE_TYPE.AGREE}>
                        <S.VoteLabel>찬성</S.VoteLabel>
                        <S.VoteCount type={VOTE_TYPE.AGREE}>{item.agreeCount}</S.VoteCount>
                      </S.VoteInfo>
                      <S.VoteInfo type={VOTE_TYPE.DISAGREE}>
                        <S.VoteLabel>반대</S.VoteLabel>
                        <S.VoteCount type={VOTE_TYPE.DISAGREE}>{item.disagreeCount}</S.VoteCount>
                      </S.VoteInfo>
                    </S.VoteInfoSection>
                  </S.ItemWrapper>
                ))}
                {hasMore && (
                  <S.Footer>
                    <S.MoreButton
                      type="button"
                      data-id={category.id}
                      onClick={handleToggleCategory}
                    >
                      {isExpanded ? '접기' : '더보기'}
                    </S.MoreButton>
                  </S.Footer>
                )}
              </S.Card>
            );
          })}
        </S.ContainerCol>
      ))}
      {dialogContent && (
        <DS.DialogOverlay onClick={handleCloseDialog}>
          <DS.Dialog
            role="dialog"
            aria-modal="true"
            aria-label="아이디어 상세"
            onClick={handleContentsClick}
          >
            <DS.DialogHeader>
              <span>아이디어 상세</span>
              <DS.DialogClose
                type="button"
                aria-label="닫기"
                onClick={handleCloseDialog}
              >
                <Image
                  src="/close.svg"
                  alt="닫기 이미지"
                  width={16}
                  height={16}
                />
              </DS.DialogClose>
            </DS.DialogHeader>
            <DS.DialogBody>{dialogContent}</DS.DialogBody>
          </DS.Dialog>
        </DS.DialogOverlay>
      )}
    </S.Container>
  );
}
