import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';
import { applyAIStructure, categorizeIdeas } from '@/lib/api/issue';

interface UseAIStructuringProps {
  issueId: string;
  ideas: IdeaWithPosition[];
  setIdeas: (ideas: IdeaWithPosition[]) => void;
}

export function useAIStructuring({ issueId, ideas, setIdeas }: UseAIStructuringProps) {
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
      const parsed = JSON.parse(aiResponse.result.message.content);
    

      if (!parsed.categories || !Array.isArray(parsed.categories)) {
        throw new Error('AI 응답 형식이 올바르지 않습니다.');
      }

      const structureResult = await applyAIStructure(issueId, parsed.categories);
      const ideaCategoryMap = structureResult.ideaCategoryMap ?? {};

      // TanStack Query 캐시 갱신 → 서버에서 최신 카테고리 데이터 fetch
      await queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'categories'] });

      const updatedIdeas = ideas.map((idea) => ({
        ...idea,
        categoryId: ideaCategoryMap[idea.id] ?? null,
        position: null,
      }));

      setIdeas(updatedIdeas);
    } catch (error) {
      console.error('AI 구조화 오류:', error);
      toast.error('AI 구조화 중 오류가 발생했습니다.');
    } finally {
      finishAIStructure();
    }
  }, [ideas, issueId, setIdeas, queryClient, finishAIStructure]);

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
