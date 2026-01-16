import { useQuery } from '@tanstack/react-query';
import type { Category } from '@/app/(with-sidebar)/issue/types/category';
import { fetchCategories } from '@/lib/api/category';
import type { Category as DbCategory } from '@/types/category';

export const useCategoryQuery = (issueId: string) => {
  return useQuery({
    queryKey: ['issues', issueId, 'categories'],
    queryFn: () => fetchCategories(issueId),
    staleTime: 1000 * 10,
    select: (data: DbCategory[]): Category[] =>
      data.map((category) => ({
        id: category.id,
        title: category.title,
        position: {
          x: category.positionX ?? 100,
          y: category.positionY ?? 100,
        },
        isMuted: false,
      })),
  });
};
