import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createTopic, type CreateTopicData } from '@/lib/api/topic';

export const useCreateTopicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicData) => createTopic(data.title, data.projectId),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      return data;
    },

    onError: (error) => {
      console.error('토픽 생성 실패:', error);
      toast.error(error.message || '토픽 생성에 실패했습니다.');
    },
  });
};
