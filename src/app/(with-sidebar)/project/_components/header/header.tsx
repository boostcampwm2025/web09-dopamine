'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import HeaderButton from '@/app/(with-sidebar)/issue/_components/header/header-button';
import * as S from './header.styles';

const ProjectHeader = () => {
  const params = useParams<{ id: string }>();
  const projectId = params.id || 'default';
  const router = useRouter();

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
        머피 서비스 런칭
      </S.LeftSection>
      <S.RightSection>
        <HeaderButton
          imageSrc="/people.svg"
          alt="팀원 초대"
          text="팀원 초대"
        />
        <S.Divider />
        <S.Profile>
          김머피
          <Image
            src="/profile.svg"
            alt="프로필"
            width={38}
            height={38}
          />
        </S.Profile>
      </S.RightSection>
    </S.HeaderContainer>
  );
};

export default ProjectHeader;
