'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as S from './project-header.styles';

const ProjectHeader = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const userImage = session?.user?.image || '/profile.svg';
  const userName = session?.user?.name || '사용자';

  const handleProfileClick = () => {
    router.push(`/mypage`);
  };

  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <Link href={'/'}>
          <Image
            src="/home.svg"
            alt="홈으로 가기"
            width={18}
            height={18}
            style={{ cursor: 'pointer' }}
          />
        </Link>
        <S.Title>내 프로젝트</S.Title>
      </S.LeftSection>
      <S.RightSection>
        <S.Profile onClick={handleProfileClick}>
          <S.Name>{userName}</S.Name>
          <Image
            src={userImage}
            alt="프로필"
            width={38}
            height={38}
            style={{ borderRadius: '50%' }}
          />
        </S.Profile>
      </S.RightSection>
    </S.HeaderContainer>
  );
};

export default ProjectHeader;
