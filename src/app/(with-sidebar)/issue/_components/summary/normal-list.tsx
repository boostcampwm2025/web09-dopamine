'use client';

import { useState, useEffect } from 'react';
import type { Idea } from '@/app/(with-sidebar)/issue/types/idea';
import Image from 'next/image';
import * as DS from './dialog.styles';
import * as S from './normal-list.styles';
import { getAllIdeas } from '../../services/issue-service';

export default function NormalList() {
  const [rawData, setRawData] = useState<Idea[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [dialogContent, setDialogContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      const ideas = await getAllIdeas();
      setRawData(ideas);
    };

    fetchIssues();
  }, []);

  const visibleItems = showAll ? rawData : rawData.slice(0, 5);
  const hasMore = rawData.length > 5;

  const handleDialogContent = () => {
    setDialogContent(null)
  };

  return (
    <S.Container>
      {visibleItems.map((item, index) => (
        <S.Item key={item.id} highlighted={item.highlighted}>
          <S.ItemLeft>
            <S.RankBadge highlighted={item.highlighted}>{index + 1}</S.RankBadge>
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
                <S.Author>{item.author}</S.Author>
                <S.Divider />
                <span>{item.category}</span>
              </S.MetaRow>
            </S.Content>
          </S.ItemLeft>
          <S.ItemRight>
            <S.VoteInfoSection>
              <S.VoteInfo type="agree">
                <S.VoteCount type="agree">{item.agreeCount}</S.VoteCount>
              </S.VoteInfo>
              <S.VoteInfo type="disagree">
                <S.VoteLabel>반대</S.VoteLabel>
                <S.VoteCount type="disagree">{item.disagreeCount}</S.VoteCount>
              </S.VoteInfo>
            </S.VoteInfoSection>
          </S.ItemRight>
        </S.Item>
      ))}
      {hasMore && (
        <S.Footer>
          <S.MoreButton type="button" onClick={() => setShowAll((prev) => !prev)}>
            {showAll ? '접기' : '더보기'}
          </S.MoreButton>
        </S.Footer>
      )}
      {dialogContent && (
        <DS.DialogOverlay onClick={handleDialogContent}>
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
                aria-label="닫기"
                onClick={handleDialogContent}
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
