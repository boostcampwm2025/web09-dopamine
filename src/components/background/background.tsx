'use client';

import * as S from './background.styles';
import FloatingShapes from './floating-shapes';

export default function Background() {
  return (
    <S.BackgroundContainer>
      <S.BlueCircle color="#60a5fa" />
      <S.GreenCircle color="#00a94f" />
      <FloatingShapes />
    </S.BackgroundContainer>
  );
}
