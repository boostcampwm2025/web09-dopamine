import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: ${theme.zIndex.hide};
  overflow: hidden;
  background: #ffffff;
`;

export const Circle = styled.div<{ color: string }>`
  position: absolute;
  width: 40vw;
  height: 40vw;
  border-radius: 50%;
  background: ${({ color }) => color};
  opacity: 0.4;
  mix-blend-mode: multiply;
  filter: blur(100px);
`;

export const BlueCircle = styled(Circle)`
  bottom: -10%;
  left: -10%;
`;

export const GreenCircle = styled(Circle)`
  top: -10%;
  right: -10%;
`;
