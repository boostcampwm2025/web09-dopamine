import { useQuery, useQueryClient } from '@tanstack/react-query';
import { checkNicknameDuplicate, generateNickname } from '@/lib/api/issue';

export const useNicknameGenerateQuery = (issueId: string) => {
  return useQuery({
    queryKey: ['nickname-generate', issueId],
    queryFn: () => generateNickname(issueId),
    staleTime: 0,
  });
};

export const useNicknameValidator = () => {
  const queryClient = useQueryClient();

  const checkDuplicate = async (issueId: string, nickname: string) => {
    if (!nickname.trim()) return { isDuplicate: false };

    try {
      const result = await queryClient.fetchQuery({
        queryKey: ['nickname-check', issueId, nickname],
        queryFn: () => checkNicknameDuplicate(issueId, nickname),
        staleTime: 0,
      });

      return result;
    } catch (error) {
      console.error('닉네임 중복 확인 에러:', error);
      throw error;
    }
  };

  return { checkDuplicate };
};
