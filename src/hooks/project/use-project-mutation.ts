import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { leaveProject } from '@/lib/api/leave';
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
    },
  });
};

export const useLeaveProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; memberId: string }) =>
      leaveProject(data.projectId, data.memberId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },

    onError: (error) => {
      console.error('프로젝트 나가기 실패:', error);
    },
  });
};
