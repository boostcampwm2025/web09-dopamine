import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createProject } from '@/lib/api/project';

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string }) => createProject(data.title),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },

    onError: (error) => {
      console.error('프로젝트 생성 실패:', error);
      toast.error(error.message || '프로젝트 생성에 실패했습니다.');
    },
  });
};
