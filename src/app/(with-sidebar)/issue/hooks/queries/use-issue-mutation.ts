import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ISSUE_STATUS, STEP_FLOW } from '@/constants/issue';
import { createQuickIssue, updateIssueStatus } from '@/lib/api/issue';
import { setUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { useIssueQuery } from './use-issue-query';

export const useQuickStartMutation = (closeModal: () => void) => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { title: string; nickname: string }) =>
      createQuickIssue(data.title, data.nickname),

    onSuccess: (newIssue) => {
      // 이슈별로 userId 저장
      setUserIdForIssue(newIssue.issueId, newIssue.userId);
      closeModal();
      router.push(`/issue/${newIssue.issueId}`);
    },

    onError: (error) => {
      console.error(error);
      toast.error('이슈 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    },
  });
};

export const useIssueStatusMutation = (issueId: string) => {
  const queryClient = useQueryClient();

  const { data: issue } = useIssueQuery(issueId);

  return useMutation({
    mutationFn: async () => {
      if (!issue) throw new Error('이슈 정보가 없습니다.');

      const currentIndex = STEP_FLOW.indexOf(issue.status);
      const nextStatus = STEP_FLOW[currentIndex + 1];

      await updateIssueStatus(issueId, nextStatus);

      return nextStatus;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
    },

    onError: (error) => {
      console.error('상태 변경 실패:', error);
    },
  });
};

export const useCloseIssueMutation = (issueId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await updateIssueStatus(issueId, ISSUE_STATUS.CLOSE);
    },

    onSuccess: () => {
      // 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
      toast.success('이슈가 종료되었습니다.');
    },

    onError: (error) => {
      console.error('이슈 종료 실패:', error);
      toast.error('이슈 종료에 실패했습니다.');
    },
  });
};
