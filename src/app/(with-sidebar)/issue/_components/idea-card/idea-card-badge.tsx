'use client';

import Image from 'next/image';
import type { CardStatus } from '../../types/idea';
import * as S from './idea-card.styles';

interface IdeaCardBadgeProps {
  status?: CardStatus;
}

export default function IdeaCardBadge({ status }: IdeaCardBadgeProps) {
  return (
    <S.Badge status={status}>
      <Image
        src="/crown.svg"
        alt="채택 아이콘"
        width={20}
        height={20}
      />
      <span>채택</span>
    </S.Badge>
  );
}
