'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleSkeleton, TextSkeleton } from '@/components/skeleton/skeleton';
import { useSmartLoading } from '@/hooks/use-smart-loading';
import * as HS from '../../../(with-sidebar)/issue/_components/header/header.styles';
import * as S from './project-header.styles';

const ProjectHeader = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const userImage = session?.user?.image;
  const userName = session?.user?.displayName;
  const showSessionLoading = useSmartLoading(sessionStatus === 'loading');

  const handleProfileClick = () => {
    router.push(`/mypage`);
  };

  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <Link href={'/'}>
          <HS.ButtonsWrapper>
            <Image
              src="/home.svg"
              alt="홈으로 가기"
              width={18}
              height={18}
              style={{ cursor: 'pointer' }}
            />
          </HS.ButtonsWrapper>
        </Link>
        <S.Title>내 프로젝트</S.Title>
      </S.LeftSection>
      <S.RightSection>
        <S.Profile onClick={handleProfileClick}>
          {showSessionLoading ? (
            <>
              <TextSkeleton width="42px" />
              <CircleSkeleton size="38px" />
            </>
          ) : (
            <>
              {userName}
              {userImage && (
                <Image
                  src={userImage}
                  alt="프로필"
                  width={38}
                  height={38}
                  style={{ borderRadius: '50%' }}
                />
              )}
            </>
          )}
        </S.Profile>
      </S.RightSection>
    </S.HeaderContainer>
  );
};

export default ProjectHeader;
