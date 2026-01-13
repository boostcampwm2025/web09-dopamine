'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useShallow } from 'zustand/shallow';
import { useCategoryOperations } from '@/app/(with-sidebar)/issue/hooks/use-category-operations';
import { useCanvasStore } from '@/app/(with-sidebar)/issue/store/use-canvas-store';
import { useIdeaStore } from '@/app/(with-sidebar)/issue/store/use-idea-store';
import {
  useIsNextButtonVisible,
  useIssueStore,
} from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { useModalStore } from '@/components/modal/use-modal-store';
import { useTooltipStore } from '@/components/tooltip/use-tooltip-store';
import { BUTTON_TEXT_MAP, ISSUE_STATUS } from '@/constants/issue';
import { getIssue } from '@/lib/api/issue';
import type { Category } from '../../types/category';
import CloseIssueModal from '../close-issue-modal/close-issue-modal';
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

  const [title, setTitle] = useState('');

  const { nextStep, closeIssue, startVote, endVote, startAIStructure } = useIssueStore(
    (state) => state.actions,
  );

  const isVisible = useIsNextButtonVisible();

  const { hasEditingIdea } = useIdeaStore(issueId);

  const openTooltip = useTooltipStore((state) => state.openTooltip);
  const closeTooltip = useTooltipStore((state) => state.closeTooltip);
  const { openModal, isOpen } = useModalStore();
  const hasOpenedModal = useRef(false);

  const { ideas } = useIdeaStore(issueId);
  const scale = useCanvasStore((state) => state.scale);
  const { categories, handleAddCategory } = useCategoryOperations(issueId, ideas, scale);

  useEffect(() => {
    if (issueState.status !== ISSUE_STATUS.CLOSE) {
      hasOpenedModal.current = false;
      return;
    }

    if (!hasOpenedModal.current && !isOpen) {
      openModal({
        title: '이슈 종료',
        content: <CloseIssueModal issueId={issueId} />,
        closeOnOverlayClick: false,
        hasCloseButton: false,
      });
      hasOpenedModal.current = true;
    }
  }, [issueState.status, isOpen, openModal]);

  // 이슈 제목 조회
  useEffect(() => {
    const initialIssueTitle = async () => {
      const issue = await getIssue(issueId);
      if (issue?.title) {
        setTitle(issue.title);
      }
    };

    initialIssueTitle();
  }, [issueId]);

  const handleNextStep = () => {
    try {
      nextStep(() => {
        if (issueState.status === ISSUE_STATUS.BRAINSTORMING) {
          if (ideas.length === 0) {
            toast.error('최소 1개 이상의 아이디어를 제출해야합니다.');
            throw new Error('아이디어가 존재하지 않습니다.');
          }
          if (hasEditingIdea) {
            toast.error('입력 중인 아이디어가 있습니다.');
            throw new Error('입력 중인 아이디어가 있습니다.');
          }
        }
        if (issueState.status === ISSUE_STATUS.CATEGORIZE) {
          if (categories.length === 0) {
            toast.error('카테고리가 없습니다.');
            throw new Error('카테고리가 없습니다.');
          }
        }

        if (issueState.status === ISSUE_STATUS.CATEGORIZE) {
          const uncategorizedIdeas = ideas.filter((idea) => idea.categoryId === null);
          if (uncategorizedIdeas.length > 0) {
            toast.error('카테고리가 지정되지 않은 아이디어가 있습니다.');
            throw new Error('카테고리가 지정되지 않은 아이디어가 있습니다.');
          }

          // 빈 카테고리 검사: 각 카테고리에 속한 아이디어가 없는지 확인
          const emptyCategories = categories.filter(
            (category) => !ideas.some((idea) => idea.categoryId === category.id),
          );
          if (emptyCategories.length > 0) {
            toast.error(`빈 카테고리가 있습니다.`);
            throw new Error('빈 카테고리가 있습니다.');
          }
        }
      });
    } catch (error) {
      toast((error as Error).message);
    }
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
              variant="outline"
            />
            <HeaderButton
              imageSrc="/stick.svg"
              alt="AI 구조화"
              text="AI 구조화"
              onClick={startAIStructure}
              variant="outline"
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
            color={isVoting ? 'black' : 'white'}
            onClick={isVoting ? endVote : startVote}
          />
        );
      case ISSUE_STATUS.SELECT:
        return (
          <HeaderButton
            text="이슈 종료"
            color="black"
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
        {title}
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
