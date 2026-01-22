import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createProject, deleteProject, updateProject } from '@/lib/api/project';

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      createProject(data.title, data.description),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },

    onError: (error) => {
      console.error('프로젝트 생성 실패:', error);
      toast.error(error.message || '프로젝트 생성에 실패했습니다.');
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string }) => deleteProject(data.id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },

    onError: (error) => {
      console.error('프로젝트 삭제 실패:', error);
    },
  });
};
