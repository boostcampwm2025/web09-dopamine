'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { VOTE_TYPE } from '@/constants/issue';
import type { RankedIdeaDto } from '@/types/report';
import * as DS from './dialog.styles';
import * as S from './normal-list.styles';

type NormalListProps = {
  normalRankings: RankedIdeaDto[];
};

export default function NormalList({ normalRankings }: NormalListProps) {
  const [showAll, setShowAll] = useState(false);
  const [dialogContent, setDialogContent] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<RankedIdeaDto[]>(normalRankings.slice(0, 5));
  const hasMore = normalRankings.length > 5; // 최초 5개 표시

  useEffect(() => {
    if (showAll) {
      setVisibleItems(normalRankings);
    } else {
      setVisibleItems(normalRankings.slice(0, 5));
    }
  }, [normalRankings, showAll]);

  const closeDialog = () => {
    setDialogContent(null);
  };

  return (
    <>
      {visibleItems.map((item, index) => (
        <S.Item
          key={item.id}
          highlighted={index === 0}
          isTop={index === 0}
        >
          <S.ItemLeft>
            <S.RankBadge highlighted={index === 0}>{index + 1}</S.RankBadge>
            <S.Content>
              <S.Title
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
              </S.Title>
              <S.MetaRow>
                <S.Author>{item.user?.displayName || item.user?.name || '익명'}</S.Author>
                <S.Divider />
                <span>{item.category?.title || '미분류'}</span>
              </S.MetaRow>
            </S.Content>
          </S.ItemLeft>
          <S.ItemRight>
            <S.VoteInfoSection>
              <S.VoteInfo type={VOTE_TYPE.AGREE}>
                <S.VoteLabel>찬성</S.VoteLabel>
                <S.VoteCount type={VOTE_TYPE.AGREE}>{item.agreeVoteCount}</S.VoteCount>
              </S.VoteInfo>
              <S.VoteInfo type={VOTE_TYPE.DISAGREE}>
                <S.VoteLabel>반대</S.VoteLabel>
                <S.VoteCount type={VOTE_TYPE.DISAGREE}>{item.disagreeVoteCount}</S.VoteCount>
              </S.VoteInfo>
            </S.VoteInfoSection>
          </S.ItemRight>
        </S.Item>
      ))}
      {hasMore && (
        <S.Footer>
          <S.MoreButton
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? '접기' : '더보기'}
          </S.MoreButton>
        </S.Footer>
      )}
      {dialogContent && (
        <DS.DialogOverlay onClick={closeDialog}>
          <DS.Dialog
            role="dialog"
            aria-modal="true"
            aria-label="아이디어 상세"
            onClick={(e) => e.stopPropagation()}
          >
            <DS.DialogHeader>
              <span>아이디어 상세</span>
              <DS.DialogClose
                type="button"
                aria-label="이슈 닫기"
                onClick={closeDialog}
              >
                <Image
                  src="/close.svg"
                  alt="이슈 닫기 이미지"
                  width={16}
                  height={16}
                />
              </DS.DialogClose>
            </DS.DialogHeader>
            <DS.DialogBody>{dialogContent}</DS.DialogBody>
          </DS.Dialog>
        </DS.DialogOverlay>
      )}
    </>
  );
}
