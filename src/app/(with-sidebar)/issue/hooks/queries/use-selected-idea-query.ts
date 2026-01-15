import { useQuery } from '@tanstack/react-query';

export const selectedIdeaQueryKey = (issueId: string) =>
  ['issues', issueId, 'selected-idea'] as const;

export function useSelectedIdeaQuery(issueId: string) {
  return useQuery<string | null>({
    queryKey: selectedIdeaQueryKey(issueId),
    queryFn: async () => null,
    enabled: false,
    initialData: null,
  });
}
