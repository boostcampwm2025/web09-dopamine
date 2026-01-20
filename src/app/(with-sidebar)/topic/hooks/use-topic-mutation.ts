import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import getAPIResponseData from '@/lib/utils/api-response';

interface CreateTopicData {
  title: string;
  projectId: string;
}

export const useCreateTopicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicData) =>
      getAPIResponseData<{ id: string; title: string }>({
        url: '/api/topic',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),

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
