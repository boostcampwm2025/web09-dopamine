'use client';

import Image from 'next/image';
import { ISSUE_STATUS } from '@/constants/issue';
import { useIssueStore } from '@/store/issue';
import HeaderButton from './header-button';
import * as S from './header.styles';

type Phase = 'ideation' | 'voting' | 'discussion';

interface IssueHeaderProps {
  currentPhase: Phase;
  onPhaseChange: (phase: Phase) => void;
  onAIStructure?: () => void;
}

const Header = ({ currentPhase, onPhaseChange, onAIStructure }: IssueHeaderProps) => {
  const { status, next } = useIssueStore();

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

  const renderActionButtons = () => {
    switch (status) {
      case ISSUE_STATUS.CATEGORIZE:
        return (
          <>
            <HeaderButton
              imageSrc="/folder.svg"
              alt="카테고리 추가"
              text="카테고리 추가"
            />
            <HeaderButton
              imageSrc="/stick.svg"
              alt="AI 구조화"
              text="AI 구조화"
              onClick={onAIStructure}
            />
          </>
        );
      case ISSUE_STATUS.VOTE:
        return (
          <HeaderButton
            imageSrc="/good.svg"
            alt="투표하기"
            text={getVoteButtonText()}
            onClick={currentPhase !== 'discussion' ? handleVoteStart : undefined}
          />
        );
      case ISSUE_STATUS.SELECT:
        return (
          <HeaderButton
            text="이슈 종료"
            variant="dark"
          />
        );
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
      {status}
      <S.RightSection>
        {status !== ISSUE_STATUS.SELECT && (
          <HeaderButton
            text="다음"
            onClick={next}
          />
        )}

        {renderActionButtons()}

        <HeaderButton
          imageSrc="/timer.svg"
          imageSize={16}
          alt="타이머"
        />
        <HeaderButton
          imageSrc="/share.svg"
          alt="공유하기"
        />
      </S.RightSection>
    </S.HeaderContainer>
  );
};

export default Header;
