import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { checkNicknameDuplicate, generateNickname, joinIssue } from '@/lib/api/issue';
import { setUserIdForIssue } from '@/lib/storage/issue-user-storage';

export const useIssueMemberMutations = (issueId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['issues', issueId, 'members'];
  const connectionId = useSseConnectionStore((state) => state.connectionIds[issueId]);

  const create = useMutation({
    mutationFn: async (nickname: string) => await joinIssue(issueId, nickname, connectionId),

    onSuccess: (issueMember) => {
      setUserIdForIssue(issueId, issueMember.userId);
      queryClient.invalidateQueries({ queryKey });
    },

    onError: (error) => {
      console.error('이슈 참여 실패:', error);
      toast.error(error.message);
    },
  });

  return { join: create };
};

export const useNicknameMutations = (issueId: string) => {
  const create = useMutation({
    mutationFn: () => generateNickname(issueId),

    onError: (error) => {
      console.error('닉네임 생성 실패:', error);
      toast.error(error.message);
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: (nickname: string) => checkNicknameDuplicate(issueId, nickname),
  });

  const checkDuplicate = async (nickname: string) => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return { isDuplicate: false };
    }

    try {
      const result = await mutateAsync(nickname);
      return result;
    } catch (error: unknown) {
      console.error('닉네임 중복 확인 에러:', error);
      const errorMessage =
        error instanceof Error ? error.message : '닉네임 중복 확인 중 오류가 발생했습니다.';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { generate: create, checkDuplicate };
};
