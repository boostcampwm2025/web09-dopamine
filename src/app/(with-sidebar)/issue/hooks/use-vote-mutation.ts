import { useMutation, useQueryClient } from '@tanstack/react-query';
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
      queryClient.setQueryData(queryKey, (old: VoteResponse) => {
        if (!old) return old;

        // 백엔드가 값을 안 줘도, 프론트에서 미리 계산하는 로직은 그대로
        const myVote = old.myVote;
        let newAgreeCount = old.agreeCount;
        let newDisagreeCount = old.disagreeCount;
        let newMyVote: 'AGREE' | 'DISAGREE' | null = voteType;

        // 취소 로직
        if (myVote === voteType) {
          if (voteType === 'AGREE') {
            newAgreeCount--;
          } else {
            newDisagreeCount--;
          }
          newMyVote = null;
        }

        // 변경 로직
        else if (myVote) {
          if (voteType === 'AGREE') {
            newAgreeCount++;
            newDisagreeCount--;
          } else {
            newDisagreeCount++;
            newAgreeCount--;
          }
        }
        // 신규 로직
        else {
          if (voteType === 'AGREE') {
            newAgreeCount++;
          } else {
            newDisagreeCount++;
          }
        }

        return {
          ...old,
          agreeCount: newAgreeCount,
          disagreeCount: newDisagreeCount,
          myVote: newMyVote,
        };
      });

      return { previousIdea };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousIdea) {
        queryClient.setQueryData(queryKey, context.previousIdea);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
