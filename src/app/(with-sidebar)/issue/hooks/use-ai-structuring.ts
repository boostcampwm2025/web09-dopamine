import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';
import { categorizeIdeas } from '@/lib/api/issue';

interface UseAIStructuringProps {
  issueId: string;
  ideas: IdeaWithPosition[];
}

export function useAIStructuring({ issueId, ideas }: UseAIStructuringProps) {
  const { isAIStructuring } = useIssueStore();
  const { finishAIStructure } = useIssueStore((state) => state.actions);

  const handleAIStructure = useCallback(async () => {
    const validIdeas = ideas
      .filter((idea) => idea.content.trim().length > 0)
      .map((idea) => ({
        id: idea.id,
        content: idea.content,
      }));

    if (validIdeas.length === 0) {
      toast.error('분류할 아이디어가 없습니다.');
      finishAIStructure();
      return;
    }

    try {
      await categorizeIdeas(issueId, validIdeas);
    } catch (error) {
      console.error('AI 구조화 오류:', error);
      toast.error('AI 구조화 중 오류가 발생했습니다.');
    } finally {
      finishAIStructure();
    }
  }, [ideas, issueId, finishAIStructure]);

  // isAIStructuring이 true가 되면 자동 실행
  useEffect(() => {
    if (isAIStructuring) {
      handleAIStructure();
    }
  }, [isAIStructuring, handleAIStructure]);

  return {
    isAIStructuring,
  };
}
