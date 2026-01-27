import { useSession } from 'next-auth/react';
import { getProviderInfo } from '@/lib/utils/provider-info';
import * as S from './login-info.styles';

export default function LoginInfo() {
  const { data: session } = useSession();
  const user = session?.user;
  const { name, icon, color } = getProviderInfo(user?.email, user?.image);

  return (
    <S.Container>
      <S.Header>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <S.Title>로그인 정보</S.Title>
      </S.Header>

      <S.LoginCard>
        <S.LoginInfoWrapper>
          <S.ProviderIcon>{icon}</S.ProviderIcon>
          <S.ProviderText>{name}로 로그인 중</S.ProviderText>
        </S.LoginInfoWrapper>
        <S.StatusBadge>CONNECTED</S.StatusBadge>
      </S.LoginCard>
    </S.Container>
  );
}
