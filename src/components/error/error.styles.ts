'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div<{ fullScreen?: boolean }>`
  min-height: ${(props) => (props.fullScreen ? '100vh' : '100%')};
  height: ${(props) => (props.fullScreen ? 'auto' : '100%')};
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: ${theme.colors.green[50]};
  ${(props) =>
    !props.fullScreen &&
    `
    background:
      linear-gradient(90deg, ${theme.colors.gray[50]} 1px, transparent 1px),
      linear-gradient(${theme.colors.gray[50]} 1px, transparent 1px);
    background-size: 40px 40px;
    background-position: 0 0;
  `}
`;

export const PostItWrapper = styled.div`
  position: relative;
`;

export const PostItMain = styled.div`
  position: relative;
  width: 380px;
  padding: 2rem;
  background-color: ${theme.colors.green[100]};
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%);
`;

export const Tape = styled.div`
  position: absolute;
  top: -0.75rem;
  left: 50%;
  transform: translateX(-50%) rotate(1deg);
  width: 5rem;
  height: 1.5rem;
  background-color: ${theme.colors.green[500]};
  opacity: 0.3;
`;

export const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

export const IconCircle = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: ${theme.radius.half};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.green[600]};
`;

export const MessageSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

export const Title = styled.h2`
  margin-bottom: 0.75rem;
  font-size: ${theme.font.size.xl};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.green[700]};
`;

export const Description = styled.p`
  line-height: 1.625;
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.green[800]};
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: ${theme.radius.small};
  font-weight: ${theme.font.weight.medium};
  font-size: ${theme.font.size.medium};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${(props) =>
    props.variant === 'secondary' ? theme.colors.green[200] : theme.colors.green[600]};
  color: ${(props) =>
    props.variant === 'secondary' ? theme.colors.green[700] : theme.colors.white};

  &:hover {
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const FoldedCorner = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: ${theme.colors.green[300]};
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
`;

export const Shadow = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  filter: blur(4px);
  opacity: 0.2;
  background-color: ${theme.colors.green[600]};
  transform: translateY(4px) rotate(0.5deg);
`;
