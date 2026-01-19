import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { categorizeIdeas } from '@/lib/api/issue';
import { IdeaWithPosition } from '../../types/idea';

export function useAIStructuringMutation(issueId: string) {
  const queryClient = useQueryClient();

  const categorize = useMutation({
    mutationKey: ['ai-structuring', issueId],
    mutationFn: () => categorizeIdeas(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'categories'] });
      toast.success('AI 구조화가 완료되었습니다.');
    },

    onError: (err) => {
      console.error('AI 구조화 오류:', err);
      toast.error('AI 구조화 중 오류가 발생했습니다.');
    },
  });

  const handleAIStructure = () => {
    const cachedData = queryClient.getQueryData<IdeaWithPosition[]>(['issues', issueId, 'ideas']);
    const ideas = cachedData || [];

    const validIdeas = ideas.filter((idea) => idea.content.trim().length > 0);

    if (validIdeas.length === 0) {
      toast.error('분류할 아이디어가 없습니다.');
      return;
    }

    categorize.mutate();
  };

  return {
    handleAIStructure,
  };
}
