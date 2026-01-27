import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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

  const create = useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(issueId, payload),

    onError: (_err) => {
      toast.error(_err.message);
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

    onError: (err) => {
      toast.error(err.message);
    },
  });

  const remove = useMutation({
    mutationFn: (categoryId: string) => deleteCategory(issueId, categoryId),

    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { create, update, remove };
};
