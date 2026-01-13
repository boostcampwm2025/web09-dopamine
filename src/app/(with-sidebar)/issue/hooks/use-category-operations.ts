import { useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useCategoryStore } from '@/app/(with-sidebar)/issue/store/use-category-store';
import type { Position } from '@/app/(with-sidebar)/issue/types/idea';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';
import type { Category } from '@/app/(with-sidebar)/issue/types/category';
import {
  createCategory as createCategoryAPI,
  deleteCategory as deleteCategoryAPI,
  fetchCategories,
  updateCategory as updateCategoryAPI,
} from '@/lib/api/category';
import type { Category as DbCategory } from '@/types/category';

export function useCategoryOperations(issueId: string, ideas: IdeaWithPosition[], scale: number) {
  const {
    categories,
    addCategory,
    deleteCategory,
    updateCategoryPosition,
    updateCategoryTitle,
    setCategories,
  } = useCategoryStore(issueId);

  const categorySizesRef = useRef<Map<string, { width: number; height: number }>>(new Map());

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

  // 카테고리 초기 로드
  useEffect(() => {
    const loadCategories = async () => {
      const fetched = await fetchCategories(issueId);
      const mapped = fetched.map((category: DbCategory): Category => ({
        id: category.id,
        title: category.title,
        position: {
          x: category.positionX ?? 100,
          y: category.positionY ?? 100,
        },
        isMuted: false,
      }));
      setCategories(mapped);
    };

    loadCategories();
  }, [issueId, setCategories]);

  // 카테고리 겹침 체크
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

  const handleCategoryPositionChange = async (id: string, position: Position) => {
    const hasOverlap = checkCategoryOverlap(id, position);
    if (hasOverlap) {
      return;
    }

    const previous = categories.find((category) => category.id === id)?.position;
    updateCategoryPosition(id, position);
    try {
      await updateCategoryAPI(issueId, id, {
        positionX: position.x,
        positionY: position.y,
      });
    } catch (error) {
      console.error('카테고리 위치 업데이트 실패:', error);
      if (previous) {
        updateCategoryPosition(id, previous);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const categoryIdeas = ideas.filter((idea) => idea.categoryId === categoryId);

    if (categoryIdeas.length > 0) {
      toast.error('카테고리에 아이디어가 있어 삭제할 수 없습니다.');
      return;
    }

    const previous = categories;
    deleteCategory(categoryId);
    try {
      await deleteCategoryAPI(issueId, categoryId);
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      setCategories(previous);
    }
  };

  const handleAddCategory = useCallback(async () => {
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

    try {
      const created = await createCategoryAPI(issueId, {
        title: '새 카테고리',
        positionX: categories.length > 0 ? maxRight + CATEGORY_GAP : START_POSITION.x,
        positionY: START_POSITION.y,
      });

      addCategory({
        id: created.id,
        title: created.title,
        position: {
          x: created.positionX ?? START_POSITION.x,
          y: created.positionY ?? START_POSITION.y,
        },
        isMuted: false,
      });
    } catch (error) {
      console.error('카테고리 생성 실패:', error);
      toast.error('카테고리 생성에 실패했습니다.');
    }
  }, [addCategory, categories, issueId, scale]);

  const handleCategoryTitleChange = async (id: string, title: string) => {
    const previous = categories.find((category) => category.id === id)?.title;
    updateCategoryTitle(id, title);
    try {
      await updateCategoryAPI(issueId, id, { title });
    } catch (error) {
      console.error('카테고리 제목 업데이트 실패:', error);
      if (previous) {
        updateCategoryTitle(id, previous);
      }
    }
  };

  return {
    categories,
    checkCategoryOverlap,
    handleCategoryTitleChange,
    handleCategoryPositionChange,
    handleDeleteCategory,
    handleAddCategory,
  };
}
