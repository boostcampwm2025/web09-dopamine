import { useQuery } from '@tanstack/react-query';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';
import type { SimpleIdea } from '@/types/idea';
import { fetchIdeas } from '@/lib/api/idea';

// 이슈의 아이디어 목록 조회 (SimpleIdea -> IdeaWithPosition)
export const useIssueIdeaQuery = (issueId: string) => {
  return useQuery({
    queryKey: ['issues', issueId, 'ideas'],
    queryFn: async () => {
      const fetchedIdeas: SimpleIdea[] = await fetchIdeas(issueId);

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
        myVote: idea.myVote,
        commentCount: idea.commentCount,
        isSelected: idea.isSelected ?? false,
        editable: false,
      }));

      return ideasWithPosition;
    },
    staleTime: 1000 * 10,
  });
};
