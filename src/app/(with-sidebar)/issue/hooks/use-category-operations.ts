import { useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useCategoryMutations } from '@/app/(with-sidebar)/issue/hooks/react-query/use-category-mutation';
import { useCategoryQuery } from '@/app/(with-sidebar)/issue/hooks/react-query/use-category-query';
import type { Position } from '@/app/(with-sidebar)/issue/types/idea';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';

export function useCategoryOperations(issueId: string, ideas: IdeaWithPosition[], scale: number) {
  const categorySizesRef = useRef<Map<string, { width: number; height: number }>>(new Map());

  const { data: categories = [], isError } = useCategoryQuery(issueId);

  const { create, update, remove } = useCategoryMutations(issueId);

  // 카테고리 위치 및 크기 업데이트
  useEffect(() => {
    const updateCategorySizes = () => {
      const newSizes = new Map<string, { width: number; height: number }>();

      categories.forEach((category) => {
        const element = document.querySelector(`[data-category-id="${category.id}"]`);
        if (element) {
          const rect = element.getBoundingClientRect();
          newSizes.set(category.id, {
            width: rect.width / scale,
            height: rect.height / scale,
          });
        }
      });

      categorySizesRef.current = newSizes;
    };

    updateCategorySizes();
  }, [categories, ideas, scale]);

  // 카테고리 겹침 체크
  const checkCategoryOverlap = useCallback(
    (draggingCategoryId: string, newPosition: Position) => {
      const draggingSize = categorySizesRef.current.get(draggingCategoryId);
      if (!draggingSize) return false;

      const isOverlapping = (position: Position) => {
        const rect1 = {
          left: position.x,
          right: position.x + draggingSize.width,
          top: position.y,
          bottom: position.y + draggingSize.height,
        };

        for (const category of categories) {
          if (category.id === draggingCategoryId) continue;

          const categorySize = categorySizesRef.current.get(category.id);
          if (!categorySize) continue;

          const rect2 = {
            left: category.position.x,
            right: category.position.x + categorySize.width,
            top: category.position.y,
            bottom: category.position.y + categorySize.height,
          };

          const isOverlapping = !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
          );

          if (isOverlapping) return true;
        }

        return false;
      };

      const currentPosition = categories.find(
        (category) => category.id === draggingCategoryId,
      )?.position;
      if (currentPosition && isOverlapping(currentPosition)) {
        return false;
      }

      return isOverlapping(newPosition);
    },
    [categories],
  );

  const handleCategoryPositionChange = (id: string, position: Position) => {
    const hasOverlap = checkCategoryOverlap(id, position);
    if (hasOverlap) {
      return;
    }

    update.mutate({
      categoryId: id,
      payload: {
        positionX: position.x,
        positionY: position.y,
      },
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryIdeas = ideas.filter((idea) => idea.categoryId === categoryId);

    if (categoryIdeas.length > 0) {
      toast.error('카테고리에 아이디어가 있어 삭제할 수 없습니다.');
      return;
    }

    remove.mutate(categoryId);
  };

  const handleAddCategory = useCallback(() => {
    const DEFAULT_CATEGORY_WIDTH = 320;
    const CATEGORY_GAP = 40;
    const START_POSITION = { x: 100, y: 100 };

    // 현재 DOM의 너비(스케일 보정)를 기준으로 새 카테고리 위치를 계산
    const maxRight = categories.reduce((currentMax, category) => {
      const element = document.querySelector(`[data-category-id="${category.id}"]`);
      const width = element
        ? element.getBoundingClientRect().width / scale
        : DEFAULT_CATEGORY_WIDTH;

      return Math.max(currentMax, category.position.x + width);
    }, 0);

    create.mutate({
      title: '새 카테고리',
      positionX: categories.length > 0 ? maxRight + CATEGORY_GAP : START_POSITION.x,
      positionY: START_POSITION.y,
    });
  }, [categories, create, scale]);

  return {
    categories,
    isError,
    checkCategoryOverlap,
    handleCategoryPositionChange,
    handleDeleteCategory,
    handleAddCategory,
  };
}
