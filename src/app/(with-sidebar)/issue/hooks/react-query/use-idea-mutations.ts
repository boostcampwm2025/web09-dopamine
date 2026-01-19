import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';
import {
  createIdea as createIdeaAPI,
  deleteIdea as deleteIdeaAPI,
  updateIdea as updateIdeaAPI,
} from '@/lib/api/idea';
import type { CreateIdeaRequest } from '@/types/idea';

export const useIdeaMutations = (issueId: string) => {
  const queryClient = useQueryClient();

  // 아이디어 생성
  const createMutation = useMutation({
    mutationFn: async (data: CreateIdeaRequest) => {
      return createIdeaAPI(issueId, data);
    },

    onError: (err) => {
      toast.error(err.message);
    },

    // 성공하든, 실패하든 무조건 실행
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'ideas'] });
    },
  });

  // 아이디어 수정 (위치, 카테고리)
  const updateMutation = useMutation({
    mutationFn: async ({
      ideaId,
      positionX,
      positionY,
      categoryId,
    }: {
      ideaId: string;
      positionX?: number | null;
      positionY?: number | null;
      categoryId?: string | null;
    }) => {
      return updateIdeaAPI(issueId, ideaId, { positionX, positionY, categoryId });
    },
    onMutate: async ({ ideaId, positionX, positionY, categoryId }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['issues', issueId, 'ideas'] });

      // 이전 데이터 스냅샷 저장
      const previousIdeas = queryClient.getQueryData<IdeaWithPosition[]>([
        'issues',
        issueId,
        'ideas',
      ]);

      // 낙관적 업데이트 로직
      // 당장은 필요 없을 수도 있지만, 추후 개선 가능성을 위해 구현
      if (previousIdeas) {
        queryClient.setQueryData<IdeaWithPosition[]>(
          ['issues', issueId, 'ideas'],
          previousIdeas.map((idea) => {
            if (idea.id !== ideaId) return idea;

            const updatedIdea = { ...idea };

            // position 업데이트: x, y 둘 다 number여야 Position 객체 생성
            if (
              positionX !== undefined &&
              positionY !== undefined &&
              positionX !== null &&
              positionY !== null
            ) {
              updatedIdea.position = { x: positionX, y: positionY };
            }

            // categoryId 업데이트
            if (categoryId !== undefined) {
              updatedIdea.categoryId = categoryId;
            }

            return updatedIdea;
          }),
        );
      }

      return { previousIdeas };
    },
    onError: (error, variables, context) => {
      console.error('아이디어 수정 실패:', error);
      toast.error(error.message);
      // 에러 시 롤백
      if (context?.previousIdeas) {
        queryClient.setQueryData(['issues', issueId, 'ideas'], context.previousIdeas);
      }
    },
    // 성공하든, 실패하든 무조건 실행
    // 낙관적 업데이트 적용시 서버 상태를 한 번 더 확인
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'ideas'] });
    },
  });

  // 아이디어 삭제
  const removeMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      return deleteIdeaAPI(issueId, ideaId);
    },
    onMutate: async (ideaId) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['issues', issueId, 'ideas'] });

      // 이전 데이터 스냅샷 저장
      const previousIdeas = queryClient.getQueryData<IdeaWithPosition[]>([
        'issues',
        issueId,
        'ideas',
      ]);

      // 낙관적 업데이트로 즉시 제거
      if (previousIdeas) {
        queryClient.setQueryData<IdeaWithPosition[]>(
          ['issues', issueId, 'ideas'],
          previousIdeas.filter((idea) => idea.id !== ideaId),
        );
      }

      return { previousIdeas };
    },
    onError: (error, variables, context) => {
      console.error('아이디어 삭제 실패:', error);
      toast.error(error.message);
      // 에러 시 롤백
      if (context?.previousIdeas) {
        queryClient.setQueryData(['issues', issueId, 'ideas'], context.previousIdeas);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'ideas'] });
    },
  });

  return {
    createIdea: createMutation.mutate,
    updateIdea: updateMutation.mutate,
    removeIdea: removeMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
};
