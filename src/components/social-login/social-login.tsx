import { signIn } from 'next-auth/react';
import Image from 'next/image';
import * as S from './social-login.styles';

interface SocialLoginProps {
  callbackUrl?: string;
  iconSize?: number;
}

const SOCIAL_ICONS = [
  { src: '/github.svg', alt: 'github', provider: 'github' },
  { src: '/google.svg', alt: 'google', provider: 'google' },
  { src: '/kakao.svg', alt: 'kakao', provider: 'kakao' },
  { src: '/naver.svg', alt: 'naver', provider: 'naver' },
];

export default function SocialLogin({ callbackUrl = '/project', iconSize = 50 }: SocialLoginProps) {
  const handleSocialLogin = (provider: string) => {
    if (
      provider === 'google' ||
      provider === 'github' ||
      provider === 'kakao' ||
      provider === 'naver'
    ) {
      signIn(provider, { callbackUrl });
    }
  };
  return (
    <S.SocialLoginContainer>
      {SOCIAL_ICONS.map((icon) => (
        <Image
          key={icon.alt}
          src={icon.src}
          alt={icon.alt}
          width={iconSize}
          height={iconSize}
          style={{ cursor: 'pointer' }}
          onClick={() => handleSocialLogin(icon.provider)}
        />
      ))}
    </S.SocialLoginContainer>
  );
}
