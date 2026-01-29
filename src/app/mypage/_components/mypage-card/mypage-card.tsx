'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import AccountActions from '../account-actions/account-actions';
import LoginInfo from '../login-info/login-info';
import ProfileInfo from '../profile-info/profile-info';
import * as S from './mypage-card.styles';

export default function MypageCard() {
  const { data: session } = useSession();
  const user = session?.user;
  const profileImage = user?.image;

  return (
    <S.CardContainer>
      <S.TopSection>
        <S.ProfileImageWrapper>
          <S.ProfileImage>
            {profileImage ? (
              <Image
                src={profileImage}
                alt="프로필"
                width={88}
                height={88}
              />
            ) : (
              'ME'
            )}
          </S.ProfileImage>
        </S.ProfileImageWrapper>
      </S.TopSection>
      <S.InfoSection>
        <S.Name>{user?.name || '사용자'}</S.Name>
        <S.Email>@{user?.email?.split('@')[0] || 'username'}</S.Email>
      </S.InfoSection>
      <S.ContentSection>
        <ProfileInfo user={user} />
        <LoginInfo user={user} />
        <AccountActions />
      </S.ContentSection>
    </S.CardContainer>
  );
}
