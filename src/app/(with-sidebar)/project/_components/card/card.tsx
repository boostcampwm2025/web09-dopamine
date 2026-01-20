import Image from 'next/image';
import * as S from './card.styles';

interface CardProps {
  variant?: 'header' | 'item';
  leftIcon: string;
  title: string;
  subtitle?: string;
  rightIcon?: string;
  showArrow?: boolean;
  onClick?: () => void;
}

const Card = ({
  variant = 'header',
  leftIcon,
  title,
  subtitle,
  rightIcon,
  showArrow = false,
  onClick,
}: CardProps) => {
  return (
    <S.CardContainer
      variant={variant}
      onClick={onClick}
    >
      <S.LeftSection>
        <S.IconWrapper variant={variant}>
          <Image
            src={leftIcon}
            alt="아이콘"
            width={variant === 'header' ? 20 : 24}
            height={variant === 'header' ? 20 : 24}
          />
        </S.IconWrapper>
        <S.ContentWrapper>
          <S.Title variant={variant}>{title}</S.Title>
          {subtitle && <S.Subtitle>{subtitle}</S.Subtitle>}
        </S.ContentWrapper>
      </S.LeftSection>
      {(rightIcon || showArrow) && (
        <S.RightSection>
          {showArrow ? (
            <S.ArrowIcon>
              <Image
                src="/leftArrow.svg"
                alt="이동"
                width={20}
                height={20}
              />
            </S.ArrowIcon>
          ) : (
            rightIcon && (
              <Image
                src={rightIcon}
                alt="편집"
                width={16}
                height={16}
              />
            )
          )}
        </S.RightSection>
      )}
    </S.CardContainer>
  );
};

export default Card;
