import { useQuery } from '@tanstack/react-query';
import { getIssueMembers } from '@/lib/api/issue';

export const useIssueMemberQuery = (issueId: string) => {
  return useQuery({
    queryKey: ['issues', issueId, 'members'],
    queryFn: () => getIssueMembers(issueId),
  });
};
