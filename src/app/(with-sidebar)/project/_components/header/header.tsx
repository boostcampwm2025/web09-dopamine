'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import HeaderButton from '@/app/(with-sidebar)/issue/_components/header/header-button';
import { useInviteProjectModal } from '@/components/modal/invite-project-modal/use-invite-project-modal';
import { TitleSkeleton } from '@/components/skeleton/skeleton';
import { useProjectQuery } from '@/hooks/project';
import { useSmartLoading } from '@/hooks/use-smart-loading';
import * as S from './header.styles';

const ProjectHeader = () => {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const router = useRouter();

  const { data: session } = useSession();
  const { data: projectData, isLoading } = useProjectQuery(projectId || '');
  const showLoading = useSmartLoading(isLoading);

  const { openInviteProjectModal } = useInviteProjectModal();

  const userName = session?.user?.displayName || '사용자';
  const userImage = session?.user?.image || '/profile.svg';

  const handleProfileClick = () => {
    router.push('/mypage');
  };

  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <Link href={'/project'}>
          <Image
            src="/leftArrow.svg"
            alt="뒤로 가기"
            width={18}
            height={18}
            style={{ cursor: 'pointer' }}
          />
        </Link>
        <S.Divider />
        {showLoading ? <TitleSkeleton width="200px" /> : projectData?.title}
      </S.LeftSection>
      <S.RightSection>
        <HeaderButton
          imageSrc="/people.svg"
          alt="팀원 초대"
          text="팀원 초대"
          onClick={(e) => openInviteProjectModal(projectId, projectData?.title || '', e)}
        />
        <S.Divider />
        <S.Profile onClick={handleProfileClick}>
          {userName}
          <Image
            src={userImage}
            alt="프로필"
            width={38}
            height={38}
            style={{ borderRadius: '50%'}}
          />
        </S.Profile>
      </S.RightSection>
    </S.HeaderContainer>
  );
};

export default ProjectHeader;
