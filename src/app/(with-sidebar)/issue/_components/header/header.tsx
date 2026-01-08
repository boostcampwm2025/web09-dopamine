'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useShallow } from 'zustand/shallow';
import { useCategoryStore } from '@/app/(with-sidebar)/issue/store/use-category-store';
import { useIdeaStore } from '@/app/(with-sidebar)/issue/store/use-idea-store';
import {
  useIsNextButtonVisible,
  useIssueStore,
} from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { useTooltipStore } from '@/components/tooltip/use-tooltip-store';
import { BUTTON_TEXT_MAP, ISSUE_STATUS } from '@/constants/issue';
import type { Category } from '../../types/category';
import ProgressBar from '../progress-bar/progress-bar';
import HeaderButton from './header-button';
import * as S from './header.styles';

const Header = () => {
  const params = useParams<{ id: string }>();
  const issueId = params.id || 'default';

  const issueState = useIssueStore(
    useShallow((state) => ({
      status: state.status,
      voteStatus: state.voteStatus,
    })),
  );

  const { nextStep, closeIssue, startVote, endVote, startAIStructure } = useIssueStore(
    (state) => state.actions,
  );

  const isVisible = useIsNextButtonVisible();

  const openTooltip = useTooltipStore((state) => state.openTooltip);
  const closeTooltip = useTooltipStore((state) => state.closeTooltip);

  const { categories, addCategory } = useCategoryStore(issueId);
  const { ideas } = useIdeaStore(issueId);

  const handleNextStep = () => {
    try {
      nextStep(() => {
        if (issueState.status === ISSUE_STATUS.CATEGORIZE) {
          if (categories.length === 0) {
            throw new Error('카테고리가 없습니다.');
          }

          const uncategorizedIdeas = ideas.filter((idea) => idea.categoryId === null);
          if (uncategorizedIdeas.length > 0) {
            throw new Error('카테고리가 지정되지 않은 아이디어가 있습니다.');
          }
        }
      });
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleAddCategory = () => {
    const maxX = categories.length > 0 ? Math.max(...categories.map((cat) => cat.position.x)) : 0;

    const newCategory: Category = {
      id: `category-${Date.now()}`,
      title: '새 카테고리',
      position: {
        x: maxX + 300,
        y: 100,
      },
      isMuted: false,
    };

    addCategory(newCategory);
  };

  const renderActionButtons = () => {
    switch (issueState.status) {
      case ISSUE_STATUS.CATEGORIZE:
        return (
          <>
            <HeaderButton
              imageSrc="/folder.svg"
              alt="카테고리 추가"
              text="카테고리 추가"
              onClick={handleAddCategory}
            />
            <HeaderButton
              imageSrc="/stick.svg"
              alt="AI 구조화"
              text="AI 구조화"
              onClick={startAIStructure}
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
