'use client';

import Image from 'next/image';
import * as S from './conclusion-section.styles';

type ConclusionSectionProps = {
  badgeText?: string;
  title: string;
  votes: number;
  memo?: string;
  candidates: number;
};

export default function ConclusionSection({
  title,
  votes,
  candidates,
  memo,
}: ConclusionSectionProps) {
  return (
    <S.Card>
      <S.Badge>
        <Image
          src="/summary-crown.svg"
          alt="채택 아이콘"
          width={14}
          height={14}
        />
        <span>Selected Idea</span>
      </S.Badge>
      <S.Title>{title}</S.Title>
      {memo && <S.Memo>{memo}</S.Memo>}
      <S.Stats>
        <S.LeftStat>
          <S.VotesValue>{votes}</S.VotesValue>
          <S.StatLabel>Votes</S.StatLabel>
        </S.LeftStat>
        <S.Border />
        <S.RightStat>
          <S.CandidatesValue>{candidates}</S.CandidatesValue>
          <S.StatLabel>Candidates</S.StatLabel>
        </S.RightStat>
      </S.Stats>
    </S.Card>
  );
}
