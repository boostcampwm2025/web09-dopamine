'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTooltipStore } from '@/components/tooltip/use-tooltip-store';
import { ISSUE_STATUS } from '@/constants/issue';
import EditIssueButton from '../edit-issue-button/edit-issue-button';
import ProgressBar from '../progress-bar/progress-bar';
import HeaderButton from './header-button';
import * as S from './header.styles';
import { useHeader } from './use-header';

const Header = () => {
  const params = useParams<{ id: string }>();
  const issueId = params.id || 'default';

  const {
    issue,
    isVisible,
    isEditButtonVisible,
    topicId,
    handleCloseIssue,
    handleNextStep,
    handleAddCategory,
    handleAIStructureStart,
    handleCopyURL,
    handleGoback,
  } = useHeader({
    issueId,
  });

  const openTooltip = useTooltipStore((state) => state.openTooltip);
  const closeTooltip = useTooltipStore((state) => state.closeTooltip);

  const renderActionButtons = () => {
    switch (issue?.status) {
      case ISSUE_STATUS.CATEGORIZE:
        return (
          <>
            <HeaderButton
              imageSrc="/folder.svg"
              alt="카테고리 추가"
              text="카테고리 추가"
              onClick={handleAddCategory}
              variant="outline"
            />
            <HeaderButton
              imageSrc="/stick.svg"
              alt="AI 구조화"
              text="AI 구조화"
              onClick={handleAIStructureStart}
              variant="outline"
            />
          </>
        );
      case ISSUE_STATUS.SELECT:
        return (
          <HeaderButton
            text="이슈 종료"
            color="black"
            onClick={handleCloseIssue}
          />
        );
    }
  };

  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <button onClick={handleGoback}>
          <S.ButtonsWrapper>
            <Image
              src={topicId ? '/leftArrow.svg' : '/home.svg'}
              alt={topicId ? '뒤로가기' : '홈으로'}
              width={18}
              height={18}
            />
          </S.ButtonsWrapper>
        </button>
        {issue?.title}
        {isEditButtonVisible && (
          <EditIssueButton
            issueId={issueId}
            currentTitle={issue?.title}
          />
        )}
      </S.LeftSection>
      <S.CenterSection>
        <ProgressBar />
      </S.CenterSection>
      <S.RightSection>
        {isVisible && (
          <>
            <HeaderButton
              text="다음"
              onClick={handleNextStep}
              onMouseEnter={(e) => {
                e.stopPropagation();
                openTooltip(
                  e.currentTarget,
                  '다음 단계로 이동하면 현재 단계로 돌아올 수 없습니다.',
                );
              }}
              onMouseLeave={closeTooltip}
            />
          </>
        )}

        {renderActionButtons()}
        <HeaderButton
          imageSrc="/share.svg"
          alt="공유하기"
          onClick={handleCopyURL}
        />
      </S.RightSection>
    </S.HeaderContainer>
  );
};

export default Header;
