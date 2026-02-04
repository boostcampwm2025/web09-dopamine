import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';
import { theme } from '@/styles/theme';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

const skeletonBackground = css`
  background: linear-gradient(
    90deg,
    ${theme.colors.gray[50]} 0%,
    ${theme.colors.gray[100]} 50%,
    ${theme.colors.gray[50]} 100%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;

const SkeletonBase = styled.div`
  ${skeletonBackground}
  border-radius: 8px;
`;

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', style }: SkeletonProps) => {
  return (
    <SkeletonBase
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      role="status"
      aria-label="로딩 중"
    />
  );
};

export const TextSkeleton = ({ width = '100%' }: { width?: string }) => {
  return <Skeleton width={width} height="16px" />;
};

export const TitleSkeleton = ({ width = '150px' }: { width?: string }) => {
  return <Skeleton width={width} height="24px" />;
};

export const CircleSkeleton = ({ size = '40px' }: { size?: string }) => {
  return <Skeleton width={size} height={size} borderRadius="50%" />;
};
