import Image from 'next/image';
import * as S from './info-card.styles';

interface InfoCardProps {
  leftIcon: string;
  rightIcon?: string;
  title: string;
  desc?: string;
}

const InfoCard = ({ leftIcon, rightIcon, title, desc }: InfoCardProps) => {
  return (
    <S.InfoCardContainer>
      <S.LeftSection>
        <S.InfoCardImageWrapper>
          <Image
            src={leftIcon}
            alt="아이콘"
            width={20}
            height={20}
          />
        </S.InfoCardImageWrapper>
        <S.TitleText>{title}</S.TitleText>
      </S.LeftSection>
      {rightIcon && (
        <S.RightSection>
          <Image
            src={rightIcon}
            alt="편집"
            width={16}
            height={16}
          />
        </S.RightSection>
      )}
    </S.InfoCardContainer>
  );
};

export default InfoCard;
