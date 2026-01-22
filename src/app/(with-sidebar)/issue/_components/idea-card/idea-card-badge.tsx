'use client';

import Image from 'next/image';
import type { CardStatus } from '../../types/idea';
import * as S from './idea-card.styles';

interface IdeaCardBadgeProps {
  status?: CardStatus;
  isHotIdea?: boolean;
}

export default function IdeaCardBadge({ status, isHotIdea }: IdeaCardBadgeProps) {
  // 채택 뱃지가 우선
  if (status === 'selected') {
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

  // Hot Idea 뱃지
  if (isHotIdea) {
    return (
      <S.HotPotatoBadge>
        <span>🔥</span>
        <span>논의가 활발해요</span>
      </S.HotPotatoBadge>
    );
  }

  return null;
}
