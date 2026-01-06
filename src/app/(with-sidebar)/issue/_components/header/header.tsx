'use client';

import Image from 'next/image';
import { useShallow } from 'zustand/shallow';
import { BUTTON_TEXT_MAP, ISSUE_STATUS } from '@/constants/issue';
import { useIsNextButtonVisible, useIssueStore } from '@/store/issue';
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
      voteStatus: state.voteStatus,
    })),
  );

  const { next, closeIssue, startVote, endVote } = useIssueStore((state) => state.actions);

  const isVisible = useIsNextButtonVisible();

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
        const isVoting = issueState.voteStatus === 'IN_PROGRESS';
        const text = BUTTON_TEXT_MAP[issueState.voteStatus];

        return (
          <HeaderButton
            imageSrc="/good.svg"
            alt="투표"
            text={text}
            variant={isVoting ? 'dark' : undefined}
            onClick={isVoting ? endVote : startVote}
          />
        );
      case ISSUE_STATUS.SELECT:
        return (
          <HeaderButton
            text="이슈 종료"
            variant="dark"
            onClick={closeIssue}
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
        {isVisible && (
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
