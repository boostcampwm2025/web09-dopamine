import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/lib/api/project';

export const useProjectsQuery = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });
};
