import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { ISSUE_STATUS, STEP_FLOW } from '@/constants/issue';
import {
  createIssueInTopic,
  createQuickIssue,
  deleteIssue,
  updateIssueStatus,
  updateIssueTitle,
} from '@/lib/api/issue';
import { setUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { IssueStatus } from '@/types/issue';

interface DbIssue {
  id: string;
  status: IssueStatus;
  topicId?: string;
}

export const useQuickStartMutation = () => {
  return useMutation({
    mutationFn: (data: { title: string; nickname: string }) =>
      createQuickIssue(data.title, data.nickname),

    onSuccess: (newIssue) => {
      // 이슈별로 userId 저장
      setUserIdForIssue(newIssue.issueId, newIssue.userId);
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
  });
};

export const useIssueStatusMutations = (issueId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['issues', issueId];
  const connectionId = useSseConnectionStore((state) => state.connectionIds[issueId]);

  const update = useMutation({
    mutationFn: async (nextStatus: IssueStatus) => {
      await updateIssueStatus(issueId, nextStatus, undefined, undefined, connectionId);
      return nextStatus;
    },

    onMutate: async (nextStatus) => {
      await queryClient.cancelQueries({ queryKey });

      const previousIssue = queryClient.getQueryData<DbIssue>(queryKey);

      if (previousIssue) {
        queryClient.setQueryData<DbIssue>(queryKey, {
          ...previousIssue,
          status: nextStatus,
        });
      }
      return { previousIssue };
    },

    onError: (err, _variables, context) => {
      if (context?.previousIssue) {
        queryClient.setQueryData(queryKey, context.previousIssue);
      }
      toast.error(err.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const close = useMutation({
    mutationFn: async () => {
      await updateIssueStatus(issueId, ISSUE_STATUS.CLOSE, undefined, undefined, connectionId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('이슈가 종료되었습니다.');
    },

    onError: (error) => {
      console.error('이슈 종료 실패:', error);
      toast.error(error.message);
    },
  });

  // 다음 단계 계산
  const handleNextStep = () => {
    const issue = queryClient.getQueryData<DbIssue>(queryKey);
    if (!issue) return;

    const currentIndex = STEP_FLOW.indexOf(issue.status);
    const nextStatus = STEP_FLOW[currentIndex + 1];

    // 계산된 값을 넘기면서 뮤테이션 실행
    if (nextStatus) {
      update.mutate(nextStatus);
    }
  };

  return { nextStep: handleNextStep, close };
};

export const useCreateIssueInTopicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { topicId: string; title: string }) =>
      createIssueInTopic(data.topicId, data.title),

    onSuccess: (newIssue, variables) => {
      // 토픽의 이슈 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['topics', variables.topicId, 'issues'],
      });
      toast.success('이슈가 생성되었습니다!');
    },

    onError: (error: Error) => {
      toast.error(error.message || '이슈 생성에 실패했습니다.');
    },
  });
};

export const useUpdateIssueTitleMutation = (issueId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; userId: string; connectionId?: string }) =>
      updateIssueTitle(issueId, data.title, data.userId, data.connectionId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['issues', issueId],
      });
      toast.success('이슈를 수정했습니다!');
    },

    onError: (error: Error) => {
      toast.error(error.message || '이슈 수정에 실패했습니다.');
    },
  });
};

export const useDeleteIssueMutation = (issueId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { userId: string; connectionId?: string }) =>
      deleteIssue(issueId, data.userId, data.connectionId),

    onSuccess: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['issues', issueId] });
      queryClient.removeQueries({ queryKey: ['issues', issueId] });

      if (data.topicId) {
        queryClient.invalidateQueries({
          queryKey: ['topics', data.topicId],
        });
      }

      toast.success('이슈를 삭제했습니다.');

      router.push(data.topicId ? `/topic/${data.topicId}` : '/');
    },

    onError: (error: Error) => {
      console.error('이슈 삭제 실패:', error);
      toast.error(error.message || '이슈 삭제에 실패했습니다.');
    },
  });
};
