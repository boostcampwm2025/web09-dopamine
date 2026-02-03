import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCanvasStore } from '@/app/(with-sidebar)/issue/store/use-canvas-store';
import { ISSUE_STATUS, MEMBER_ROLE } from '@/constants/issue';
import { useTopicId } from '@/hooks';
import {
  useAIStructuringMutation,
  useIssueMemberQuery,
  useIssueQuery,
  useIssueStatusMutations,
} from '@/hooks/issue';
import { IssueStatus } from '@/types/issue';
import { useCategoryOperations, useIdeasWithTemp, useIssueIdentity } from '../../hooks';

interface UseHeaderParams {
  issueId: string;
}

export function useHeader({ issueId }: UseHeaderParams) {
  const { data: issue } = useIssueQuery(issueId);
  const { nextStep } = useIssueStatusMutations(issueId);

  const { topicId } = useTopicId();
  const router = useRouter();

  const { userId } = useIssueIdentity(issueId);

  const { data: members = [] } = useIssueMemberQuery(issueId, !!userId);
  const currentMember = members.find((member) => member.id === userId);

  const { handleAIStructure } = useAIStructuringMutation(issueId);

  const isOwner = currentMember?.role === MEMBER_ROLE.OWNER;
  const { ideas, hasEditingIdea } = useIdeasWithTemp(issueId);
  const scale = useCanvasStore((state) => state.scale);
  const { categories, handleAddCategory } = useCategoryOperations(issueId, ideas, scale);

  const isEditButtonVisible = topicId ? true : isOwner;

  const hiddenStatus = [ISSUE_STATUS.SELECT, ISSUE_STATUS.CLOSE] as IssueStatus[];
  const isVisible = issue && !hiddenStatus.includes(issue.status as IssueStatus);

  const handleGoback = useCallback(() => {
    if (topicId) {
      router.push(`/topic/${topicId}`);
    } else {
      router.push('/');
    }
  }, [issueId, topicId]);

  // 이슈 종료 모달 열기
  const handleCloseIssue = useCallback(async () => {
    if (!isOwner) {
      toast.error('방장만 이슈를 종료할 수 있습니다.');
      return;
    }

    try {
      // API 호출하여 SSE 브로드캐스팅 (모든 사용자에게 모달 열림)
      const response = await fetch(`/api/issues/${issueId}/close-modal`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to broadcast close modal');
      }
      // SSE 이벤트로 모든 사용자(방장 포함)에게 모달이 열림
    } catch (error) {
      console.error('Failed to open close modal:', error);
      toast.error('모달 열기에 실패했습니다.');
      return;
    }
  }, [issueId, isOwner]);

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

  // URL 공유
  const handleCopyURL = () => {
    const textToCopy = `${window.location.origin}/issue/${issueId}`;
    copyToClipboard(textToCopy);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다.');
    } catch (error) {
      console.error(error);
      toast.error('URL 복사가 실패했습니다.');
    }
  };

  return {
    issue,
    isOwner,
    isVisible,
    isEditButtonVisible,
    handleCloseIssue,
    handleNextStep,
    handleAddCategory,
    handleAIStructureStart,
    handleCopyURL,
    handleGoback,
  };
}
