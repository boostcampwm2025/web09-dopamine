import { useMutation, useQueryClient } from '@tanstack/react-query';
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
    onError: (_error, _selectedIdeaId, context) => {
      if (context?.previousSelectedIdeaId !== undefined) {
        queryClient.setQueryData(queryKey, context.previousSelectedIdeaId);
      }
    },
  });
}
