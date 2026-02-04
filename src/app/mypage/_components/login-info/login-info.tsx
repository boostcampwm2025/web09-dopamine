import { useEffect, useState } from 'react';
import { getProviders } from '@/lib/api/auth';
import { getProviderInfo } from '@/lib/utils/provider-info';
import * as S from './login-info.styles';

export default function LoginInfo() {
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };

    fetchProviders();
  }, []);

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
      {providers.map((provider, i) => {
        const { name, icon, color } = getProviderInfo(provider);

        return (
          <S.LoginCard key={provider ?? i}>
            <S.LoginInfoWrapper>
              <S.ProviderIcon style={{ color }}>{icon}</S.ProviderIcon>
              <S.ProviderText>{name}</S.ProviderText>
            </S.LoginInfoWrapper>
            <S.StatusBadge>CONNECTED</S.StatusBadge>
          </S.LoginCard>
        );
      })}
    </S.Container>
  );
}
