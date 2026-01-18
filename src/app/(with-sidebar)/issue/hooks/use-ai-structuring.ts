import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';
import { applyAIStructure, categorizeIdeas } from '@/lib/api/issue';

interface UseAIStructuringProps {
  issueId: string;
  ideas: IdeaWithPosition[];
}

export function useAIStructuring({ issueId, ideas }: UseAIStructuringProps) {
  const queryClient = useQueryClient();
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
      const aiResponse = await categorizeIdeas(issueId, validIdeas);

      if (!aiResponse.categories || !Array.isArray(aiResponse.categories)) {
        throw new Error('AI 응답 형식이 올바르지 않습니다.');
      }

      await applyAIStructure(issueId, aiResponse.categories);

      // TanStack Query 캐시 갱신 → 서버에서 최신 데이터 fetch
      await queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'categories'] });
      await queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'ideas'] });
    } catch (error) {
      console.error('AI 구조화 오류:', error);
      toast.error('AI 구조화 중 오류가 발생했습니다.');
    } finally {
      finishAIStructure();
    }
  }, [ideas, issueId, queryClient, finishAIStructure]);

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
