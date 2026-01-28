import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { createCategory, deleteCategory, updateCategory } from '@/lib/api/category';

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
    mutationFn: (payload: CategoryPayload) => createCategory(issueId, payload, connectionId),

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
    }) => updateCategory(issueId, categoryId, payload, connectionId),

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
