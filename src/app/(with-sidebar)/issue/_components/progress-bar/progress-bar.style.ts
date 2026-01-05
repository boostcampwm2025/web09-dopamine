import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  margin-top: 16px;
`;

export const StepWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;

  &:last-child {
    flex: 0;
  }
`;

export const Circle = styled.div<{ isActive: boolean; delay: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 28px;
  height: 28px;
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.radius.half};
  background-color: ${({ isActive }) =>
    isActive ? theme.colors.green[600] : theme.colors.gray[300]};
  transition: all 0.3s ease;
  transition-delay: ${({ delay }) => `${delay}s`};
`;

export const Label = styled.span<{ isActive: boolean; delay: number }>`
  position: absolute;
  top: -65%;
  white-space: nowrap;
  font-size: ${theme.font.size.small};
  color: ${({ isActive }) => (isActive ? theme.colors.green[600] : theme.colors.gray[400])};
  transition: all 0.3s ease;
  transition-delay: ${({ delay }) => `${delay}s`};
`;

export const LineWrapper = styled.div`
  position: relative;
  flex-grow: 1;
  height: 6px;
  background-color: ${theme.colors.gray[300]};
`;

export const ActiveLineBar = styled.div<{ isActive: boolean; duration: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ isActive }) => (isActive ? '100%' : '0')};
  background-color: ${theme.colors.green[600]};
  transition: all ${({ duration }) => `${duration}s`} ease-in;
`;
