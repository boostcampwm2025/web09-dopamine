import { useQuery } from '@tanstack/react-query';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';
import { getIdea } from '@/lib/api/idea';
import { fetchIdeas } from '@/lib/api/idea';

export const useIdeaQuery = (issueId: string, ideaId: string, userId: string) => {
  // temp- 아이디어는 서버에 존재하지 않으므로 쿼리를 비활성화
  const isTemp = ideaId.startsWith('temp-');

  return useQuery({
    queryKey: ['issues', issueId, 'ideas', ideaId],
    queryFn: () => getIdea(issueId, ideaId, userId),
    staleTime: 1000 * 10,
    enabled: !isTemp,
  });
};

export const useIssueIdeaQuery = (issueId: string) => {
  return useQuery({
    queryKey: ['issues', issueId, 'ideas'],
    queryFn: async () => {
      const fetchedIdeas = await fetchIdeas(issueId);

      // DB 데이터를 IdeaWithPosition 형태로 변환
      const ideasWithPosition: IdeaWithPosition[] = fetchedIdeas.map((idea: any) => ({
        ...idea,
        author: idea.nickname || '익명',
        position:
          idea.positionX && idea.positionY ? { x: idea.positionX, y: idea.positionY } : null,
        editable: false,
        categoryId: idea.categoryId || idea.category?.id || null,
      }));

      return ideasWithPosition;
    },
    staleTime: 1000 * 10, // 10초
  });
};
