import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { postVote } from '@/lib/api/vote';

interface VoteResponse {
  agreeCount: number;
  disagreeCount: number;
  myVote: 'AGREE' | 'DISAGREE' | null;
}

export const useVoteMutation = (issueId: string, ideaId: string) => {
  const queryClient = useQueryClient();
  const ideaQueryKey = ['issues', issueId, 'ideas', ideaId];
  const ideasListQueryKey = ['issues', issueId, 'ideas'];

  return useMutation({
    mutationFn: (variables: { userId: string; voteType: 'AGREE' | 'DISAGREE' }) =>
      postVote({ issueId, ideaId, ...variables }),

    onMutate: async ({ voteType }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ideaQueryKey });
      await queryClient.cancelQueries({ queryKey: ideasListQueryKey });

      // 실패 시 복구를 위해 현재 상태 저장
      const previousIdea = queryClient.getQueryData(ideaQueryKey);
      const previousIdeas = queryClient.getQueryData(ideasListQueryKey);

      // 목록 쿼리 캐시 업데이트 (UI 즉시 반영)
      queryClient.setQueryData(ideasListQueryKey, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;

        const index = oldData.findIndex((idea: any) => idea.id === ideaId);
        if (index === -1) return oldData;

        // 해당 인덱스만 업데이트
        const newData = [...oldData];
        newData[index] = {
          ...newData[index],
          myVote: voteType,
        };
        return newData;
      });

      return { previousIdea, previousIdeas };
    },

    onSuccess: (data) => {
      // 목록 쿼리 캐시 업데이트
      queryClient.setQueryData(ideasListQueryKey, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;

        const index = oldData.findIndex((idea: any) => idea.id === ideaId);
        if (index === -1) return oldData;

        // 해당 인덱스만 업데이트
        const newData = [...oldData];
        newData[index] = {
          ...newData[index],
          myVote: data.myVote,
          agreeCount: data.agreeCount,
          disagreeCount: data.disagreeCount,
        };
        return newData;
      });
    },

    onError: (err, _variables, context) => {
      toast.error(err.message);
      if (context?.previousIdea) {
        queryClient.setQueryData(ideaQueryKey, context.previousIdea);
      }
      if (context?.previousIdeas) {
        queryClient.setQueryData(ideasListQueryKey, context.previousIdeas);
      }
    },
  });
};
