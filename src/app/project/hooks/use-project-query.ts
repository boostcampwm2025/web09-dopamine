import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/lib/api/project';

export const useProjectsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    enabled,
  });
};
