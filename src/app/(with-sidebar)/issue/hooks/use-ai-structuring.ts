import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { categorizeIdeas } from '@/lib/api/issue';
import { createCategory } from '@/lib/api/category';
import { updateIdea } from '@/lib/api/idea';
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
        // 1. 카테고리를 DB에 생성하고 실제 ID로 동기화
        const createdCategories = await Promise.all(
          aiResponse.categories.map(
            async (cat: { title: string; ideaIds: string[] }, index: number) => {
              const position = {
                x: 100 + index * 600,
                y: 100,
              };
              const created = await createCategory(issueId, {
                title: cat.title,
                positionX: position.x,
                positionY: position.y,
              });

              return {
                id: created.id,
                title: created.title,
                position: {
                  x: created.positionX ?? position.x,
                  y: created.positionY ?? position.y,
                },
                isMuted: false,
              } as Category;
            },
          ),
        );

        setCategories(createdCategories);

        // 2. 각 아이디어의 categoryId 업데이트 (실제 DB ID 사용)
        const updatedIdeas = ideas.map((idea) => {
          const categoryIndex = aiResponse.categories.findIndex((cat: any) =>
            cat.ideaIds.includes(idea.id),
          );

          if (categoryIndex !== -1) {
            return {
              ...idea,
              categoryId: createdCategories[categoryIndex].id,
              position: null, // 카테고리 내부는 position 불필요
            };
          }

          return idea;
        });

        setIdeas(updatedIdeas);
        await Promise.all(
          updatedIdeas
            .filter((idea) => idea.categoryId !== null)
            .map((idea) =>
              updateIdea(issueId, idea.id, {
                categoryId: idea.categoryId,
                positionX: null,
                positionY: null,
              }),
            ),
        );
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
