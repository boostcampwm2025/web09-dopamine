'use client';

import Image from 'next/image';
import * as S from './header-button.styles';

type Variant = 'default' | 'dark';

interface HeaderButtonProps {
  text?: string;
  imageSrc?: string;
  imageSize?: number;
  alt?: string;
  variant?: Variant;
  onClick?: () => void;
}

const HeaderButton = ({
  text,
  imageSrc,
  imageSize = 14,
  alt = '',
  variant = 'default',
  onClick,
}: HeaderButtonProps) => {
  return (
    <S.ButtonContainer
      variant={variant}
      onClick={onClick}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={alt}
          width={imageSize}
          height={imageSize}
        />
      )}
      {text && <span>{text}</span>}
    </S.ButtonContainer>
  );
};

export default HeaderButton;
