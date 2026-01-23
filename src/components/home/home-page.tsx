'use client';

import { Session } from 'next-auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Background from '@/components/background/background';
import CreateIssueModal from '@/components/modal/issue-create-modal/issue-create-modal';
import { useModalStore } from '@/components/modal/use-modal-store';
import SocialLogin from '../social-login/social-login';
import * as S from './home-page.styles';

interface HomePageProps {
  session: Session | null;
}

export default function HomePage({ session }: HomePageProps) {
  const router = useRouter();
  const { openModal } = useModalStore();

  const handleStart = () => {
    openModal({
      title: '이슈 생성',
      content: <CreateIssueModal />,
      closeOnOverlayClick: true,
      hasCloseButton: true,
    });
  };

  const handleGoToProject = () => {
    if (session) {
      router.push('/project');
      return;
    }
  };

  const renderProjectOrSocialLogin = () => {
    return (
      <>
        {session ? (
          <S.StartButton
            background="#3B82F6"
            onClick={handleGoToProject}
          >
            프로젝트로 이동
          </S.StartButton>
        ) : (
          <SocialLogin />
        )}
      </>
    );
  };

  return (
    <>
      <Background />
      <S.Container>
        <S.LogoContainer>
          <S.Logo>M</S.Logo>
          <S.Text>Murphy</S.Text>
        </S.LogoContainer>
        <S.TitleContainer>
          <S.Title>
            발산은 <S.Highlight color="#3B82F6">자유롭게</S.Highlight>,
          </S.Title>
          <S.Title>
            수렴은 <S.Highlight color="#00A94F">확실하게</S.Highlight>
            <Image
              src={'/check.svg'}
              alt="check"
              width={35}
              height={35}
              style={{ position: 'relative', top: -50 }}
            />
          </S.Title>
        </S.TitleContainer>
        <S.SubTitleContainer>
          <S.Text>
            아이디어 브레인스토밍부터 의사결정까지,{' '}
            <S.Highlight
              color="#000000"
              background="#F0FDF4"
            >
              Murphy
            </S.Highlight>
            가 가장 스마트한
          </S.Text>
          <S.Text>길을 안내합니다.</S.Text>
        </S.SubTitleContainer>
        <S.ButtonContainer>
          {renderProjectOrSocialLogin()}
          <S.StartButton onClick={handleStart}>빠르게 시작하기</S.StartButton>
        </S.ButtonContainer>
      </S.Container>
    </>
  );
}
