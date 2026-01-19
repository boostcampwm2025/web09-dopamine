import { useQuery } from '@tanstack/react-query';
import { getIdea } from '@/lib/api/idea';

export const useIdeaQuery = (ideaId: string, userId: string) => {
  return useQuery({
    queryKey: ['ideas', ideaId],
    queryFn: () => getIdea(ideaId, userId),
    staleTime: 1000 * 10,
  });
};
