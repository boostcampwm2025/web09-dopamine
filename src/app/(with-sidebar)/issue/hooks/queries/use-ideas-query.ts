import { useQuery } from '@tanstack/react-query';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';
import { fetchIdeas } from '@/lib/api/idea';

export const useIdeasQuery = (issueId: string) => {
  return useQuery({
    queryKey: ['issues', issueId, 'ideas'],
    queryFn: async () => {
      const fetchedIdeas = await fetchIdeas(issueId);

      // DB 데이터를 IdeaWithPosition 형태로 변환
      const ideasWithPosition: IdeaWithPosition[] = fetchedIdeas.map((idea) => ({
        ...idea,
        author: idea.user?.displayName || idea.user?.name || '익명',
        position:
          idea.positionX && idea.positionY ? { x: idea.positionX, y: idea.positionY } : null,
        editable: false,
      }));

      return ideasWithPosition;
    },
    staleTime: 1000 * 10, // 10초
  });
};
