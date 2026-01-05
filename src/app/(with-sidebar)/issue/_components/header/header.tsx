'use client';

import Image from 'next/image';
import { useShallow } from 'zustand/shallow';
import { ISSUE_STATUS } from '@/constants/issue';
import { useIssueStore } from '@/store/issue';
import ProgressBar from '../progress-bar/progress-bar';
import HeaderButton from './header-button';
import * as S from './header.styles';

interface IssueHeaderProps {
  onAIStructure?: () => void;
}

const Header = ({ onAIStructure }: IssueHeaderProps) => {
  const issueState = useIssueStore(
    useShallow((state) => ({
      status: state.status,
      isVoteActive: state.isVoteActive,
      next: state.next,
      toggleVoteActvie: state.toggleVoteActvie,
      closeIssue: state.closeIssue,
    })),
  );

  const renderActionButtons = () => {
    switch (issueState.status) {
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
            text={issueState.isVoteActive ? '투표 종료' : '투표 시작'}
            variant={issueState.isVoteActive ? 'dark' : undefined}
            onClick={issueState.toggleVoteActvie}
          />
        );
      case ISSUE_STATUS.SELECT:
        return (
          <HeaderButton
            text="이슈 종료"
            variant="dark"
            onClick={issueState.closeIssue}
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
      <S.CenterSection>
        <ProgressBar />
      </S.CenterSection>
      <S.RightSection>
        {issueState.status !== ISSUE_STATUS.SELECT && (
          <HeaderButton
            text="다음"
            onClick={issueState.next}
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
