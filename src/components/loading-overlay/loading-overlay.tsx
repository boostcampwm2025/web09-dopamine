import * as S from './loading-overlay.styles';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = '로딩 중...' }: LoadingOverlayProps) {
  return (
    <S.Overlay>
      <S.Spinner />
      <S.Message>{message}</S.Message>
    </S.Overlay>
  );
}
