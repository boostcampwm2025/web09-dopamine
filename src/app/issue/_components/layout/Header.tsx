'use client';

import Image from 'next/image';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import HeaderButton from './HeaderButton';

type Phase = 'ideation' | 'voting' | 'discussion';

interface IssueHeaderProps {
  currentPhase: Phase;
  onPhaseChange: (phase: Phase) => void;
}

const HeaderContainer = styled.div`
  height: 56px;
  padding-inline: 16px;
  background-color: white;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${theme.colors.gray[100]};
  justify-content: space-between;
`;

const LeftSection = styled.div`
  gap: 12px;
  display: flex;
  font-size: ${theme.font.size.body2};
  font-weight: ${theme.font.weight.semibold};
  color: black;
  align-items: center;
`;

const RightSection = styled.div`
  gap: 8px;
  display: flex;
  align-items: center;
`;

const IssueHeader = ({ currentPhase, onPhaseChange }: IssueHeaderProps) => {
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
    <HeaderContainer>
      <LeftSection>
        <Image
          src="/leftArrow.svg"
          alt="뒤로가기"
          width={18}
          height={18}
        />
        초기 이슈 편성
      </LeftSection>
      <RightSection>
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
        />
        <HeaderButton imageSrc="/share.svg" />
        <HeaderButton
          text="이슈 종료"
          variant="dark"
        />
      </RightSection>
    </HeaderContainer>
  );
};

export default IssueHeader;
