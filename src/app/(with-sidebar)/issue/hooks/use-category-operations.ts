import { useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useCategoryStore } from '@/app/(with-sidebar)/issue/store/use-category-store';
import type { Position } from '@/app/(with-sidebar)/issue/types/idea';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';

export function useCategoryOperations(issueId: string, ideas: IdeaWithPosition[], scale: number) {
  const { categories, deleteCategory, updateCategoryPosition } =
    useCategoryStore(issueId);

  const categorySizesRef = useRef<Map<string, { width: number; height: number }>>(new Map());

  // 카테고리 크기 업데이트
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

  // 카테고리 겹침 검사
  const checkCategoryOverlap = useCallback(
    (draggingCategoryId: string, newPosition: Position) => {
      const draggingSize = categorySizesRef.current.get(draggingCategoryId);
      if (!draggingSize) return false;

      const rect1 = {
        left: newPosition.x,
        right: newPosition.x + draggingSize.width,
        top: newPosition.y,
        bottom: newPosition.y + draggingSize.height,
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
    },
    [categories],
  );

  const handleCategoryPositionChange = (id: string, position: Position) => {
    const hasOverlap = checkCategoryOverlap(id, position);
    if (hasOverlap) {
      return;
    }

    updateCategoryPosition(id, position);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryIdeas = ideas.filter((idea) => idea.categoryId === categoryId);

    if (categoryIdeas.length > 0) {
      toast.error(`카테고리에 아이디어가 존재합니다.`);
      return;
    }

    deleteCategory(categoryId);
  };

  return {
    categories,
    checkCategoryOverlap,
    handleCategoryPositionChange,
    handleDeleteCategory,
  };
}
