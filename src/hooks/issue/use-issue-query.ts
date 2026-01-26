import { useQuery } from '@tanstack/react-query';
import { getIssue } from '@/lib/api/issue';
import { getTopicIssues } from '@/lib/api/issue-map';

export const useIssueQuery = (issueId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: () => getIssue(issueId),
    enabled: enabled && !!issueId,
  });
};

export const useTopicIssuesQuery = (topicId: string | null | undefined) => {
  return useQuery({
    queryKey: ['topics', topicId, 'issues'],
    queryFn: () => getTopicIssues(topicId!),
    enabled: !!topicId,
  });
};
