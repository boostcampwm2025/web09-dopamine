import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { selectIdea as selectIdeaAPI } from '@/lib/api/issue';
import { selectedIdeaQueryKey } from './use-selected-idea-query';

export function useSelectedIdeaMutation(issueId: string) {
  const queryClient = useQueryClient();
  const queryKey = selectedIdeaQueryKey(issueId);

  return useMutation({
    mutationFn: (selectedIdeaId: string) => selectIdeaAPI(issueId, selectedIdeaId),
    onMutate: async (selectedIdeaId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousSelectedIdeaId = queryClient.getQueryData<string | null>(queryKey);
      queryClient.setQueryData(queryKey, selectedIdeaId);
      return { previousSelectedIdeaId };
    },
    onError: (error, _selectedIdeaId, context) => {
      toast.error(error.message);
      if (context?.previousSelectedIdeaId !== undefined) {
        queryClient.setQueryData(queryKey, context.previousSelectedIdeaId);
      }
    },
  });
}
