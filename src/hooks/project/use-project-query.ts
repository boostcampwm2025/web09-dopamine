import { useQuery } from '@tanstack/react-query';
import { getProject, getProjects } from '@/lib/api/project';

export const useProjectsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    enabled,
  });
};

export const useProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 10,
  });
};
