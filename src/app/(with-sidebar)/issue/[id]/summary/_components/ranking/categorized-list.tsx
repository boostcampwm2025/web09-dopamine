'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { VOTE_TYPE } from '@/constants/issue';
import type { CategoryRanking } from '@/types/report';
import * as S from './categorized-list.styles';
import * as DS from './dialog.styles';

type CategorizedListProps = {
  categorizedRankings: CategoryRanking[];
};

export default function CategorizedList({ categorizedRankings }: CategorizedListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [dialogContent, setDialogContent] = useState<string | null>(null);

  const columns = useMemo(
    () =>
      categorizedRankings.reduce<[CategoryRanking[], CategoryRanking[]]>(
        (acc, card, index) => {
          acc[index % 2].push(card);
          return acc;
        },
        [[], []],
      ),
    [categorizedRankings],
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
          {colCards.map(({ categoryId, categoryTitle, ideas }) => {
            const isExpanded = expandedCategories[categoryId] ?? false;
            const visibleIdeas = isExpanded ? ideas : ideas.slice(0, 3);
            const hasMore = ideas.length > 3;

            return (
              <S.Card
                key={categoryId}
                id={categoryId}
                title={categoryTitle}
              >
                <S.Header>
                  <S.HeaderLeft>
                    <S.Title>{categoryTitle}</S.Title>
                  </S.HeaderLeft>
                </S.Header>
                {visibleIdeas.map((item) => (
                  <S.ItemWrapper
                    key={item.id}
                    isSelected={item.isSelected}
                  >
                    <S.ItemLeft>
                      <S.RankBadge
                        highlighted={item.rank === 1}
                        isSelected={item.isSelected}
                      >
                        {item.isSelected ? (
                          <Image
                            src="/summary-crown.svg"
                            alt="채택"
                            width={10}
                            height={10}
                          />
                        ) : (
                          item.rank
                        )}
                      </S.RankBadge>
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
                      data-id={categoryId}
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
