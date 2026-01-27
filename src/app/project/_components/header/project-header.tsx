'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import * as S from './project-header.styles';

const ProjectHeader = () => {
  const { data: session } = useSession();
  const userImage = session?.user?.image || '/profile.svg';
  const userName = session?.user?.name || '사용자';

  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <S.Title>내 프로젝트</S.Title>
      </S.LeftSection>
      <S.RightSection>
        <S.Name>{userName}</S.Name>
        <S.Profile>
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
