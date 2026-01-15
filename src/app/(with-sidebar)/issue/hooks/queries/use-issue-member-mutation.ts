import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { joinIssue } from '@/lib/api/issue';
import { setUserIdForIssue } from '@/lib/storage/issue-user-storage';

export const useIssueMemberMutations = (issueId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['issues', issueId, 'members'];

  const create = useMutation({
    mutationFn: async (nickname: string) => await joinIssue(issueId, nickname),

    onSuccess: (issueMember) => {
      setUserIdForIssue(issueId, issueMember.userId);
      queryClient.invalidateQueries({ queryKey });
    },

    onError: (error) => {
      console.error(error);
      toast.error('참여 중 문제가 발생했습니다.');
    },
  });

  return { join: create };
};
