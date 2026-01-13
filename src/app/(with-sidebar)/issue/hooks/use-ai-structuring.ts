import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { applyAIStructure, categorizeIdeas } from '@/lib/api/issue';
import type { Category } from '@/app/(with-sidebar)/issue/types/category';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';

interface UseAIStructuringProps {
  issueId: string;
  ideas: IdeaWithPosition[];
  setIdeas: (ideas: IdeaWithPosition[]) => void;
  setCategories: (categories: Category[]) => void;
}

export function useAIStructuring({
  issueId,
  ideas,
  setIdeas,
  setCategories,
}: UseAIStructuringProps) {
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

      const structureResult = await applyAIStructure(issueId, aiResponse.categories);
      const createdCategories = Array.isArray(structureResult.categories)
        ? structureResult.categories
        : [];
      const ideaCategoryMap = structureResult.ideaCategoryMap ?? {};

      const nextCategories = createdCategories.map((category: any) => ({
        id: category.id,
        title: category.title,
        position: {
          x: category.positionX ?? 0,
          y: category.positionY ?? 0,
        },
        isMuted: false,
      })) as Category[];

      setCategories(nextCategories);

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
  }, [ideas, issueId, setIdeas, setCategories, finishAIStructure]);

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
