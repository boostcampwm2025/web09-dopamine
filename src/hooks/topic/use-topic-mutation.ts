import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { type CreateTopicData, createTopic, deleteTopic, updateTopicTitle } from '@/lib/api/topic';

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

export const useUpdateTopicTitleMutation = (topicId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; userId: string }) =>
      updateTopicTitle(topicId, data.title, data.userId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['topics', topicId],
      });

      toast.success('토픽을 수정했습니다!');
    },

    onError: (error: Error) => {
      console.error('토픽 수정 실패:', error);
      toast.error(error.message || '토픽 수정에 실패했습니다.');
    },
  });
};

export const useDeleteTopicMutation = (topicId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteTopic(topicId),

    onSuccess: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['topics', topicId] });
      queryClient.removeQueries({ queryKey: ['topics', topicId] });

      toast.success('토픽이 삭제되었습니다.');

      router.push(`/project/${data.projectId}`);
    },

    onError: (error: Error) => {
      console.error('토픽 삭제 실패:', error);
      toast.error(error.message || '토픽 삭제에 실패했습니다.');
    },
  });
};
