import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ISSUE_STATUS, STEP_FLOW } from '@/constants/issue';
import { createIssueInTopic, createQuickIssue, updateIssueStatus } from '@/lib/api/issue';
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

  const update = useMutation({
    mutationFn: async (nextStatus: IssueStatus) => {
      await updateIssueStatus(issueId, nextStatus);
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
        toast.error(err.message);
      }
    },
  });

  const close = useMutation({
    mutationFn: async () => {
      await updateIssueStatus(issueId, ISSUE_STATUS.CLOSE);
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
