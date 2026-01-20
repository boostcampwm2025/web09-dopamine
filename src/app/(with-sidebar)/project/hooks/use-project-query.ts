import { useQuery } from '@tanstack/react-query';
import getAPIResponseData from '@/lib/utils/api-response';
import { ProjectwithTopic } from '@/types/project';

export const useProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () =>
      getAPIResponseData<ProjectwithTopic>({
        url: `/api/project/${projectId}`,
        method: 'GET',
      }),
    enabled: !!projectId,
    staleTime: 1000 * 10,
  });
};
