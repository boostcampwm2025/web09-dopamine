'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as S from './mypage-header.styles';

export default function MypageHeader() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <S.MypageHeaderContainer>
      <S.BackButtonWrapper onClick={handleBack}>
        <Image
          src="/leftArrow.svg"
          alt="뒤로가기"
          width={18}
          height={18}
        />
        <S.BackButtonText>돌아가기</S.BackButtonText>
      </S.BackButtonWrapper>
      <S.Title>내 프로필</S.Title>
    </S.MypageHeaderContainer>
  );
}
