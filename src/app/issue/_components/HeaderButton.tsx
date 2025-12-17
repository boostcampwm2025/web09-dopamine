'use client';

import Image from 'next/image';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

type Radius = 'medium' | 'full';

interface HeaderButtonProps {
  text?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  radius?: Radius;
  onClick?: () => void;
}

const radiusMap = {
  medium: theme.radius.medium,
  full: theme.radius.full,
};

const ButtonContainer = styled.button<{ radius: Radius }>`
  border-radius: ${({ radius }) => radiusMap[radius]};
  padding-inline: 12px;
  padding-block: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid ${theme.colors.gray[200]};
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  background-color: transparent;
  cursor: pointer;
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.body5};
`;

const HeaderButton = ({
  text,
  imageSrc,
  imageAlt = '',
  radius = 'medium',
  onClick,
}: HeaderButtonProps) => {
  return (
    <ButtonContainer
      radius={radius}
      onClick={onClick}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={14}
          height={14}
        />
      )}
      {text && <span>{text}</span>}
    </ButtonContainer>
  );
};

export default HeaderButton;
