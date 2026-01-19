import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { postVote } from '@/lib/api/vote';

interface VoteResponse {
  agreeCount: number;
  disagreeCount: number;
  myVote: 'AGREE' | 'DISAGREE' | null;
}

export const useVoteMutation = (ideaId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['ideas', ideaId];

  return useMutation({
    mutationFn: (variables: { userId: string; voteType: 'AGREE' | 'DISAGREE' }) =>
      postVote({ ideaId, ...variables }),

    onMutate: async ({ voteType }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey });

      // 실패 시 복구를 위해 현재 상태 저장
      const previousIdea = queryClient.getQueryData(queryKey);

      // 캐시된 데이터 강제 수정 (UI 즉시 반영)
      queryClient.setQueryData(queryKey, (oldData: VoteResponse) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          myVote: voteType,
        };
      });

      return { previousIdea };
    },

    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          myVote: data.myVote,
          agreeCount: data.agreeCount,
          disagreeCount: data.disagreeCount,
        };
      });
    },

    onError: (err, _variables, context) => {
      toast.error(err.message);
      if (context?.previousIdea) {
        queryClient.setQueryData(queryKey, context.previousIdea);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
