import { useQuery } from '@tanstack/react-query';
import { getIssue } from '@/lib/api/issue';

export const useIssueQuery = (issueId: string) => {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: () => getIssue(issueId),
  });
};
