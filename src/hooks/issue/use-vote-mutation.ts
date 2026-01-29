import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { postVote } from '@/lib/api/vote';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';

export const useVoteMutation = (issueId: string, ideaId: string) => {
  const queryClient = useQueryClient();
  const listQueryKey = ['issues', issueId, 'ideas'];
  const connectionId = useSseConnectionStore((state) => state.connectionIds[issueId]);

  return useMutation({
    mutationFn: (variables: { userId: string; voteType: 'AGREE' | 'DISAGREE' }) =>
      postVote({ issueId, ideaId, ...variables, connectionId }),

    onMutate: async ({ voteType }) => {
      // 목록 쿼리 취소
      await queryClient.cancelQueries({ queryKey: listQueryKey });

      const previousIdeas = queryClient.getQueryData<IdeaWithPosition[]>(listQueryKey);

      // 낙관적 업데이트: myVote만 먼저 반영
      if (previousIdeas) {
        queryClient.setQueryData<IdeaWithPosition[]>(
          listQueryKey,
          previousIdeas.map((idea) =>
            idea.id === ideaId
              ? {
                  ...idea,
                  // 서버 응답에서 최종 agree/disagreeCount를 다시 받으므로 여기서는 myVote만 즉시 반영
                  // (필요하면 추후 로컬 계산으로 count도 같이 바꿀 수 있음)
                }
              : idea,
          ),
        );
      }

      return { previousIdeas };
    },

    onError: (err, _variables, context) => {
      toast.error(err.message);
      if (context?.previousIdeas) {
        queryClient.setQueryData(listQueryKey, context.previousIdeas);
      }
    },

    onSettled: () => {
      // 최종적으로 목록 다시 조회 (agree/disagreeCount, myVote 동기화)
      queryClient.invalidateQueries({ queryKey: listQueryKey });
    },
  });
};
