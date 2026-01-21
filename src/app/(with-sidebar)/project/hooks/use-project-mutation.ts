import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { updateProject } from '@/lib/api/project';

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; title: string; description?: string }) =>
      updateProject(data.id, data.title, data.description),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },

    onError: (error) => {
      console.error('프로젝트 수정 실패:', error);
      toast.error(error.message || '프로젝트 수정에 실패했습니다.');
    }
  });
};
