import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createCategory, deleteCategory, updateCategory } from '@/lib/api/category';
import type { Category as DbCategory } from '@/types/category';

type CategoryPayload = {
  title: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
};

export const useCategoryMutations = (issueId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['categories', issueId];

  const create = useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(issueId, payload),

    onSuccess: (newCategory) => {
      queryClient.setQueryData(queryKey, (oldData: DbCategory[] | undefined) => {
        if (!oldData) return [newCategory];
        return [...oldData, newCategory];
      });
    },

    onError: () => {
      toast.error('카테고리 생성에 실패했습니다.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const update = useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: Partial<CategoryPayload>;
    }) => updateCategory(issueId, categoryId, payload),

    onMutate: async ({ categoryId, payload }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousCategories = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: DbCategory[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((cat) => (cat.id === categoryId ? { ...cat, ...payload } : cat));
      });

      return { previousCategories };
    },

    onError: (_err, _variables, context) => {
      toast.error('카테고리 수정에 실패했습니다.');
      if (context?.previousCategories) {
        queryClient.setQueryData(queryKey, context.previousCategories);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const remove = useMutation({
    mutationFn: (categoryId: string) => deleteCategory(issueId, categoryId),

    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({ queryKey });

      const previousCategories = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: DbCategory[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter((cat) => cat.id !== categoryId);
      });

      return { previousCategories };
    },

    onError: (_err, _variables, context) => {
      toast.error('카테고리 삭제에 실패했습니다.');
      if (context?.previousCategories) {
        queryClient.setQueryData(queryKey, context.previousCategories);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { create, update, remove };
};
