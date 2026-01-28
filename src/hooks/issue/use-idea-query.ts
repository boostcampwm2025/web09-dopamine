import { useQuery } from '@tanstack/react-query';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';
import type { SimpleIdea } from '@/types/idea';
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
      const fetchedIdeas: SimpleIdea[] = await fetchIdeas(issueId);

      // SimpleIdea -> IdeaWithPosition 변환
      const ideasWithPosition: IdeaWithPosition[] = fetchedIdeas.map((idea) => ({
        id: idea.id,
        userId: idea.userId,
        content: idea.content,
        author: idea.nickname,
        categoryId: idea.categoryId,
        position:
          idea.positionX !== null && idea.positionY !== null
            ? { x: idea.positionX, y: idea.positionY }
            : null,
        agreeCount: idea.agreeCount,
        disagreeCount: idea.disagreeCount,
        commentCount: idea.commentCount,
        editable: false,
      }));

      return ideasWithPosition;
    },
    staleTime: 1000 * 10, // 10초
  });
};
