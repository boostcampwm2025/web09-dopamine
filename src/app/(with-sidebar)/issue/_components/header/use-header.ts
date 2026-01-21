import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import CloseIssueModal from '@/app/(with-sidebar)/issue/_components/close-issue-modal/close-issue-modal';
import { useCanvasStore } from '@/app/(with-sidebar)/issue/store/use-canvas-store';
import { useModalStore } from '@/components/modal/use-modal-store';
import { ISSUE_STATUS, MEMBER_ROLE } from '@/constants/issue';
import { getIssueMember } from '@/lib/api/issue';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { IssueStatus } from '@/types/issue';
import {
  useAIStructuringMutation,
  useCategoryOperations,
  useIdeasWithTemp,
  useIssueQuery,
  useIssueStatusMutations,
} from '../../hooks';

interface UseHeaderParams {
  issueId: string;
}

export function useHeader({ issueId }: UseHeaderParams) {
  const { data: issue } = useIssueQuery(issueId);
  const { nextStep } = useIssueStatusMutations(issueId);

  const userId = getUserIdForIssue(issueId) ?? '';

  // 현재 사용자의 정보 조회
  const { data: currentUser } = useQuery({
    queryKey: ['issues', issueId, 'members', userId],
    queryFn: () => getIssueMember(issueId, userId),
    enabled: !!userId,
  });

  const { handleAIStructure } = useAIStructuringMutation(issueId);

  const isOwner = currentUser && currentUser.role === MEMBER_ROLE.OWNER;
  const { ideas, hasEditingIdea } = useIdeasWithTemp(issueId);
  const { openModal } = useModalStore();
  const scale = useCanvasStore((state) => state.scale);
  const { categories, handleAddCategory } = useCategoryOperations(issueId, ideas, scale);

  const hiddenStatus = [ISSUE_STATUS.SELECT, ISSUE_STATUS.CLOSE] as IssueStatus[];
  const isVisible = issue && !hiddenStatus.includes(issue.status as IssueStatus);

  // 이슈 종료 모달 열기
  const handleCloseIssue = useCallback(async () => {
    if (!isOwner) {
      toast.error('방장만 이슈를 종료할 수 있습니다.');
      return;
    }

    try {
      // API 호출하여 SSE 브로드캐스팅
      const response = await fetch(`/api/issues/${issueId}/close-modal`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to broadcast close modal');
      }
    } catch (error) {
      console.error('Failed to open close modal:', error);
      toast.error('모달 열기에 실패했습니다.');
      return;
    }

    // 방장 본인에게도 모달 열기
    openModal({
      title: '이슈 종료',
      content: React.createElement(CloseIssueModal, { issueId, isOwner }),
      modalType: 'close-issue',
    });
  }, [issueId, userId, isOwner, openModal]);

  // 단계 검증
  const validateStep = useCallback(() => {
    if (issue?.status === ISSUE_STATUS.BRAINSTORMING) {
      if (ideas.length === 0) {
        toast.error('최소 1개 이상의 아이디어를 제출해야합니다.');
        throw new Error('아이디어가 존재하지 않습니다.');
      }
      if (hasEditingIdea) {
        toast.error('입력 중인 아이디어가 있습니다.');
        throw new Error('입력 중인 아이디어가 있습니다.');
      }
    }
    if (issue?.status === ISSUE_STATUS.CATEGORIZE) {
      if (categories.length === 0) {
        toast.error('카테고리가 없습니다.');
        throw new Error('카테고리가 없습니다.');
      }

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

    return true;
  }, [issue?.status, ideas, hasEditingIdea, categories]);

  // 다음 단계로 이동
  const handleNextStep = useCallback(() => {
    try {
      // owner 체크
      if (!isOwner) {
        toast.error('방장만 다음 단계로 넘어갈 수 있습니다.');
        return;
      }

      validateStep();
      nextStep();
    } catch (error) {
      console.error(error);
    }
  }, [isOwner, validateStep, nextStep]);

  // AI 구조화
  const handleAIStructureStart = () => {
    if (!isOwner) {
      toast.error('방장만 AI 구조화를 진행할 수 있습니다.');
      return;
    }

    handleAIStructure();
  };

  return {
    issue,
    isOwner,
    isVisible,
    handleCloseIssue,
    handleNextStep,
    handleAddCategory,
    handleAIStructureStart,
  };
}
