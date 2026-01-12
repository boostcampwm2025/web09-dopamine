'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import toast from 'react-hot-toast';
import Background from '@/components/background/background';
import { createQuickIssue } from '@/lib/api/issue';

const BaseFlex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Container = styled(BaseFlex)`
  gap: 24px;
  width: 100%;
  height: 100%;
  min-width: 650px;
`;

const LogoContainer = styled(BaseFlex)`
  flex-direction: row;
  gap: 8px;
`;

const Logo = styled(BaseFlex)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00a94f 0%, #059669 100%);
  box-shadow:
    0 10px 15px -3px #bbf7d0,
    0 4px 6px -4px #bbf7d0;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
`;

const TitleContainer = styled(BaseFlex)`
  gap: 8px;
`;

const Title = styled.h1`
  font-size: 90px;
  font-weight: 800;
  line-height: 96px;
  white-space: nowrap;
`;

const Highlight = styled.span<{ color: string; background?: string }>`
  color: ${({ color }) => color};
  ${({ background }) => background && `background: ${background};`}
`;

const SubTitleContainer = styled(BaseFlex)`
  gap: 8px;
  color: #4b5563;
`;

const Text = styled.p`
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
`;

const BtnContainer = styled(BaseFlex)`
  margin-top: 30px;
  flex-direction: row;
  gap: 8px;
`;

const StartButton = styled.button`
  width: 200px;
  height: 60px;
  border-radius: 16px;
  background: #00a94f;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
`;

const SocialLoginContainer = styled(BaseFlex)`
  flex-direction: row;
  gap: 50px;
`;

const HorizontalLine = styled.div`
  width: 450px;
  height: 1px;
  background: #9a9a9a;
`;

const SOCIAL_ICONS = [
  { src: '/github.svg', alt: 'github' },
  { src: '/google.svg', alt: 'google' },
  { src: '/kakao.svg', alt: 'kakao' },
  { src: '/naver.svg', alt: 'naver' },
];

export default function HomePage() {
  const router = useRouter();

  const handleQuickStart = async () => {
    const issueId = await createQuickIssue('1', '저녁 메뉴 회의', '용가리');

    if (issueId) {
      router.push(`/issue/${issueId}`);
    } else {
      toast.error('이슈 생성이 실패했습니다.');
      console.error('이슈 생성에 실패했습니다.');
    }
  };

  return (
    <>
      <Background />
      <Container>
        <LogoContainer>
          <Logo>M</Logo>
          <Text>Murphy</Text>
        </LogoContainer>
        <TitleContainer>
          <Title>
            발산은 <Highlight color="#3B82F6">자유롭게</Highlight>,
          </Title>
          <Title>
            수렴은 <Highlight color="#00A94F">확실하게</Highlight>
            <Image
              src={'/check.svg'}
              alt="check"
              width={35}
              height={35}
              style={{ position: 'relative', top: -50 }}
            />
          </Title>
        </TitleContainer>
        <SubTitleContainer>
          <Text>
            아이디어 브레인스토밍부터 의사결정까지,{' '}
            <Highlight
              color="#000000"
              background="#F0FDF4"
            >
              Murphy
            </Highlight>{' '}
            가 가장 스마트한
          </Text>
          <Text>길을 안내합니다.</Text>
        </SubTitleContainer>
        <BtnContainer>
          <StartButton onClick={handleQuickStart}>빠르게 시작하기</StartButton>
        </BtnContainer>
        <HorizontalLine />
        <SocialLoginContainer>
          {SOCIAL_ICONS.map((icon) => (
            <Image
              key={icon.alt}
              src={icon.src}
              alt={icon.alt}
              width={50}
              height={50}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </SocialLoginContainer>
      </Container>
    </>
  );
}
