import { useQuery } from '@tanstack/react-query';
import { getIssueMembers } from '@/lib/api/issue';

export const useIssueMemberQuery = (issueId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['issues', issueId, 'members'],
    queryFn: () => getIssueMembers(issueId),
    enabled: enabled && !!issueId,
  });
};
