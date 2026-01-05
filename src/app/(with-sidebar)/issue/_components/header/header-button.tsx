'use client';

import Image from 'next/image';
import * as S from './header-button.styles';

type Variant = 'default' | 'dark';

interface HeaderButtonProps {
  text?: string;
  imageSrc?: string;
  imageSize?: number;
  variant?: Variant;
  onClick?: () => void;
}

const HeaderButton = ({
  text,
  imageSrc,
  variant = 'default',
  imageSize = 14,
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
          alt=""
          width={imageSize}
          height={imageSize}
        />
      )}
      {text && <span>{text}</span>}
    </S.ButtonContainer>
  );
};

export default HeaderButton;
