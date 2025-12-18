'use client';

import styled from '@emotion/styled';
import FloatingShapes from './FloatingShapes';

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background: #ffffff;
`;

const Circle = styled.div<{ color: string }>`
  position: absolute;
  width: 40vw;
  height: 40vw;
  border-radius: 50%;
  background: ${({ color }) => color};
  opacity: 0.4;
  mix-blend-mode: multiply;
  filter: blur(100px);
`;

const BlueCircle = styled(Circle)`
  bottom: -10%;
  left: -10%;
`;

const GreenCircle = styled(Circle)`
  top: -10%;
  right: -10%;
`;

export default function Background() {
  return (
    <BackgroundContainer>
      <BlueCircle color="#60a5fa" />
      <GreenCircle color="#00a94f" />
      <FloatingShapes />
    </BackgroundContainer>
  );
}
