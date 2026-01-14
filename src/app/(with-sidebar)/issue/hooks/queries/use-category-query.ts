import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/lib/api/category';

export const useCategoryQuery = (issueId: string) => {
  return useQuery({
    queryKey: ['issues', issueId, 'categories'],
    queryFn: () => fetchCategories(issueId),
    staleTime: 1000 * 10,
  });
};
