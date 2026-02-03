import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { generateNickname, joinIssue, updateIssueMemberNickname } from '@/lib/api/issue';
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

  return { generate: create };
};

export const useUpdateNicknameMutation = (issueId: string, userId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['issues', issueId, 'members'];

  const update = useMutation({
    mutationFn: (nickname: string) => updateIssueMemberNickname(issueId, userId, nickname),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('닉네임이 수정되었습니다.');
    },

    onError: (error) => {
      console.error('닉네임 수정 실패:', error);
      // 에러 메시지 처리 (예: 중복 닉네임)
      if (error.message === 'NICKNAME_ALREADY_EXISTS') {
        toast.error('이미 존재하는 닉네임입니다.');
      } else {
        toast.error('닉네임 수정에 실패했습니다.');
      }
    },
  });

  return { update };
};
