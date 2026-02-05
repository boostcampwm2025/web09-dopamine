import { useQuery } from '@tanstack/react-query';
import { getIssue } from '@/lib/api/issue';
import { getTopicIssues } from '@/lib/api/issue-map';
import { ApiError } from '@/lib/utils/api-response';

export const useIssueQuery = (issueId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: () => getIssue(issueId),
    enabled: enabled && !!issueId,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.code === 'ISSUE_NOT_FOUND') return false;
      return failureCount < 3;
    },
  });
};

export const useTopicIssuesQuery = (topicId: string | null | undefined) => {
  return useQuery({
    queryKey: ['topics', topicId, 'issues'],
    queryFn: () => getTopicIssues(topicId!),
    enabled: !!topicId,
  });
};
