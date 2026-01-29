import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

const spin = keyframes`
  0% { 
    transform: rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg); 
  }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.overlay};
  backdrop-filter: blur(4px);
`;

export const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const Message = styled.p`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin-top: 20px;
`;
