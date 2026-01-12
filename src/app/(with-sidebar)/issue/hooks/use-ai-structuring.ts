import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { categorizeIdeas } from '@/lib/api/issue';
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

      // AI 응답 처리
      if (aiResponse.categories && Array.isArray(aiResponse.categories)) {
        // 1. 카테고리 생성
        const newCategories: Category[] = aiResponse.categories.map(
          (cat: { title: string; ideaIds: string[] }, index: number) => ({
            id: `category-${Date.now()}-${index}`,
            title: cat.title,
            position: {
              x: 100 + index * 600,
              y: 100,
            },
            isMuted: false,
          }),
        );

        setCategories(newCategories);

        // 2. 각 아이디어의 categoryId 업데이트
        const updatedIdeas = ideas.map((idea) => {
          const categoryIndex = aiResponse.categories.findIndex((cat: any) =>
            cat.ideaIds.includes(idea.id),
          );

          if (categoryIndex !== -1) {
            return {
              ...idea,
              categoryId: newCategories[categoryIndex].id,
              position: null, // 카테고리 내부는 position 불필요
            };
          }

          return idea;
        });

        setIdeas(updatedIdeas);
      }
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
