import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { checkNicknameDuplicate, generateNickname, joinIssue } from '@/lib/api/issue';
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
      console.error('이슈 참여 실패:', error);
      toast.error('참여 중 문제가 발생했습니다.');
    },
  });

  return { join: create };
};

export const useNicknameMutations = (issueId: string) => {
  const create = useMutation({
    mutationFn: () => generateNickname(issueId),

    onError: (error) => {
      console.error('닉네임 생성 실패:', error);
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: (nickname: string) => checkNicknameDuplicate(issueId, nickname),
  });

  const checkDuplicate = async (nickname: string) => {
    if (!nickname.trim()) return { isDuplicate: false };

    try {
      const result = await mutateAsync(nickname);
      return result;
    } catch (error) {
      console.error('닉네임 중복 확인 에러:', error);
      throw error;
    }
  };

  return { generate: create, checkDuplicate };
};
