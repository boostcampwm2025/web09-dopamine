import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { CLIENT_ERROR_MESSAGES } from '@/constants/error-messages';
import { createCategory, deleteCategory, updateCategory } from '@/lib/api/category';
import type { Category } from '@/types/category';

type CategoryPayload = {
  title: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
};

export const useCategoryMutations = (issueId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['issues', issueId, 'categories'];
  const connectionId = useSseConnectionStore((state) => state.connectionIds[issueId]);

  const create = useMutation({
    mutationFn: async (payload: CategoryPayload) => {
      const categories = queryClient.getQueryData<Category[]>(queryKey);
      if (categories?.some((c) => c.title === payload.title)) {
        throw new Error(CLIENT_ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
      }
      return createCategory(issueId, payload, connectionId);
    },

    onError: (_err) => {
      toast.error(_err.message);
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
    }) => {
      if (payload.title) {
        const categories = queryClient.getQueryData<Category[]>(queryKey);
        if (categories?.some((c) => c.title === payload.title && c.id !== categoryId)) {
          throw new Error(CLIENT_ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
        }
      }
      return updateCategory(issueId, categoryId, payload, connectionId);
    },

    onError: (err) => {
      toast.error(err.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const remove = useMutation({
    mutationFn: (categoryId: string) => deleteCategory(issueId, categoryId, connectionId),

    onError: (err) => {
      toast.error(err.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { create, update, remove };
};
