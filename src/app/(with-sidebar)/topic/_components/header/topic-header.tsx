'use client';

import Image from 'next/image';
import * as S from './topic-header.styles';

export default function TopicHeader() {
  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <Image
          src="/leftArrow.svg"
          alt="뒤로가기"
          width={18}
          height={18}
        />
        토픽 제목
      </S.LeftSection>
    </S.HeaderContainer>
  );
}
