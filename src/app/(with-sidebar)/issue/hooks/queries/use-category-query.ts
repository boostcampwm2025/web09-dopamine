import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/lib/api/category';

export const useCategoryQuery = (issueId: string) => {
  return useQuery({
    queryKey: ['categories', issueId],
    queryFn: () => fetchCategories(issueId),
    staleTime: 1000 * 10,
  });
};
