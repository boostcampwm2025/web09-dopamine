import Image from 'next/image';
import * as S from './topic-card.styles';

interface TopicCardProps {
  id: number;
  title: string;
  issueCount: number;
  status: string;
  iconSrc?: string;
  onClick?: () => void;
}

const TopicCard = ({ title, issueCount, status, onClick }: TopicCardProps) => {
  return (
    <S.TopicCardContainer onClick={onClick}>
      <S.LeftSection>
        <S.IconWrapper>
          <Image
            src="/folder.svg"
            alt="토픽 아이콘"
            width={24}
            height={24}
          />
        </S.IconWrapper>
        <S.ContentWrapper>
          <S.Title>{title}</S.Title>
          <S.InfoText>
            이슈 {issueCount}개 • {status}
          </S.InfoText>
        </S.ContentWrapper>
      </S.LeftSection>
      <S.RightSection>
        <S.ArrowIcon>
          <Image
            src="/leftArrow.svg"
            alt="이동"
            width={20}
            height={20}
          />
        </S.ArrowIcon>
      </S.RightSection>
    </S.TopicCardContainer>
  );
};

export default TopicCard;
