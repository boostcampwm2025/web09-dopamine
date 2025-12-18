'use client';

import Image from 'next/image';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

type Variant = 'default' | 'dark';

interface HeaderButtonProps {
  text?: string;
  imageSrc?: string;
  imageSize?: number;
  variant?: Variant;
  onClick?: () => void;
}

const ButtonContainer = styled.button<{ variant: Variant }>`
  border-radius: ${theme.radius.medium};
  padding-inline: 12px;
  padding-block: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: ${theme.font.weight.bold};
  font-size: ${theme.font.size.medium};

  ${({ variant }) =>
    variant === 'dark'
      ? `
    background-color: black;
    color: white;
    border: 1px solid black;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  `
      : `
    background-color: white;
    color: black;
    border: 1px solid ${theme.colors.gray[200]};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  `}
`;

const HeaderButton = ({
  text,
  imageSrc,
  variant = 'default',
  imageSize = 14,
  onClick,
}: HeaderButtonProps) => {
  return (
    <ButtonContainer
      variant={variant}
      onClick={onClick}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt=""
          width={imageSize}
          height={imageSize}
        />
      )}
      {text && <span>{text}</span>}
    </ButtonContainer>
  );
};

export default HeaderButton;
