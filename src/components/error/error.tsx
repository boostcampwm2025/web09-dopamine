'use client';

import { useRouter } from 'next/navigation';
import * as S from './error.styles';

interface ErrorPageProps {
  onRetry?: () => void;
  onGoHome?: () => void;
}


const AlertCircleIcon =
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>



export function ErrorPage({ onRetry, onGoHome }: ErrorPageProps) {
  const router = useRouter();
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.refresh();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      router.push('/');
    }
  };

  return (
    <S.Container>  
      <S.PostItWrapper>
        <S.PostItMain>
          <S.Tape />

          <S.IconWrapper>
            <S.IconCircle>
              {AlertCircleIcon}
            </S.IconCircle>
          </S.IconWrapper>

          <S.MessageSection>
            <S.Title>앗! 문제가 발생했어요</S.Title>
            <S.Description>
              알 수 없는 에러가 발생했습니다.
              <br />
              잠시 후 다시 시도해주세요.
            </S.Description>
          </S.MessageSection>

          <S.ButtonGroup>
            <S.Button onClick={handleRetry}>다시 시도</S.Button>
            <S.Button variant="secondary" onClick={handleGoHome}>
              홈으로 가기
            </S.Button>
          </S.ButtonGroup>

          <S.FoldedCorner />
        </S.PostItMain>

        <S.Shadow />
      </S.PostItWrapper>
    </S.Container>
  );
}