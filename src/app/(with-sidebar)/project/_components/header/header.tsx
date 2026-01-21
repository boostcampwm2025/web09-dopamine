'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useProjectQuery } from '../../hooks/use-project-query';
import HeaderButton from '@/app/(with-sidebar)/issue/_components/header/header-button';
import * as S from './header.styles';

const ProjectHeader = () => {
  const params = useParams<{ id: string }>();
  const projectId = params.id || 'default';
  const router = useRouter();

  const { data: session } = useSession();
  const { data: projectData } = useProjectQuery(projectId);

  const userName = session?.user?.name || '사용자';
  const userImage = session?.user?.image || '/profile.svg';
  const projectTitle = projectData?.title || '로딩 중...';

  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <Image
          src="/home.svg"
          alt="홈으로 가기"
          width={18}
          height={18}
          onClick={() => router.push('/project')}
          style={{ cursor: 'pointer' }}
        />
        <S.Divider />
        {projectTitle}
      </S.LeftSection>
      <S.RightSection>
        <HeaderButton
          imageSrc="/people.svg"
          alt="팀원 초대"
          text="팀원 초대"
        />
        <S.Divider />
        <S.Profile>
          {userName}
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
