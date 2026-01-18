import { useQuery } from '@tanstack/react-query';
import { getIdea } from '@/lib/api/idea';

export const useIdeaQuery = (ideaId: string, userId: string) => {
  // temp- 아이디어는 서버에 존재하지 않으므로 쿼리를 비활성화
  const isTemp = ideaId.startsWith('temp-');

  return useQuery({
    queryKey: ['ideas', ideaId],
    queryFn: () => getIdea(ideaId, userId),
    staleTime: 1000 * 10,
    enabled: !isTemp,
  });
};
