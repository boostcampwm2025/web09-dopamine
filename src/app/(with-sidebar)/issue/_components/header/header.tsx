'use client';

import Image from 'next/image';
import HeaderButton from './header-button';
import * as S from './header.styles';

type Phase = 'ideation' | 'voting' | 'discussion';

interface IssueHeaderProps {
  currentPhase: Phase;
  onPhaseChange: (phase: Phase) => void;
  onAIStructure?: () => void;
}

const Header = ({ currentPhase, onPhaseChange, onAIStructure }: IssueHeaderProps) => {
  const handleVoteStart = () => {
    if (currentPhase === 'ideation') {
      onPhaseChange('voting');
      return;
    }
    if (currentPhase === 'voting') {
      onPhaseChange('discussion');
      return;
    }
  };

  const getVoteButtonText = () => {
    switch (currentPhase) {
      case 'ideation':
        return '투표 시작';
      case 'voting':
        return '토론 시작';
      case 'discussion':
        return '토론 중';
      default:
        return '투표 시작';
    }
  };
  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <Image
          src="/leftArrow.svg"
          alt="뒤로가기"
          width={18}
          height={18}
        />
        서비스 홍보 방안
      </S.LeftSection>
      <S.RightSection>
        <HeaderButton
          imageSrc="/timer.svg"
          imageSize={16}
        />
        <HeaderButton
          imageSrc="/good.svg"
          text={getVoteButtonText()}
          onClick={currentPhase !== 'discussion' ? handleVoteStart : undefined}
        />
        <HeaderButton
          imageSrc="/folder.svg"
          text="카테고리 추가"
        />
        <HeaderButton
          imageSrc="/stick.svg"
          text="AI 구조화"
          onClick={onAIStructure}
        />
        <HeaderButton imageSrc="/share.svg" />
        <HeaderButton
          text="이슈 종료"
          variant="dark"
        />
      </S.RightSection>
    </S.HeaderContainer>
  );
};

export default Header;
