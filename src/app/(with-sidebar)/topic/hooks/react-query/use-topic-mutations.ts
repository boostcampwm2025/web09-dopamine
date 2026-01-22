import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createConnection as createConnectionAPI,
  deleteConnection as deleteConnectionAPI,
  updateNodePosition as updateNodePositionAPI,
} from '@/lib/api/issue-map';
import type { IssueConnection, IssueNode } from '@/types/issue';

export const useTopicMutations = (topicId: string) => {
  const queryClient = useQueryClient();

  // 연결 생성
  const createConnectionMutation = useMutation({
    mutationFn: async (data: {
      sourceIssueId: string;
      targetIssueId: string;
      sourceHandle: string | null;
      targetHandle: string | null;
    }) => {
      return createConnectionAPI(topicId, data);
    },
    onMutate: async (newConnection) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['topics', topicId, 'connections'] });

      // 이전 데이터 스냅샷 저장
      const previousConnections = queryClient.getQueryData<IssueConnection[]>([
        'topics',
        topicId,
        'connections',
      ]);

      // 낙관적 업데이트: 임시 ID로 즉시 추가
      if (previousConnections) {
        const optimisticConnection: IssueConnection = {
          id: `temp-${Date.now()}`,
          ...newConnection,
        };
        queryClient.setQueryData<IssueConnection[]>(
          ['topics', topicId, 'connections'],
          [...previousConnections, optimisticConnection],
        );
      }

      return { previousConnections };
    },
    onError: (error, variables, context) => {
      console.error('연결 생성 실패:', error);
      toast.error('연결 생성에 실패했습니다.');
      // 에러 시 롤백
      if (context?.previousConnections) {
        queryClient.setQueryData(['topics', topicId, 'connections'], context.previousConnections);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['topics', topicId, 'connections'] });
    },
  });

  // 연결 삭제
  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      return deleteConnectionAPI(topicId, connectionId);
    },
    onMutate: async (connectionId) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['topics', topicId, 'connections'] });

      // 이전 데이터 스냅샷 저장
      const previousConnections = queryClient.getQueryData<IssueConnection[]>([
        'topics',
        topicId,
        'connections',
      ]);

      // 낙관적 업데이트로 즉시 제거
      if (previousConnections) {
        queryClient.setQueryData<IssueConnection[]>(
          ['topics', topicId, 'connections'],
          previousConnections.filter((conn) => conn.id !== connectionId),
        );
      }

      return { previousConnections };
    },
    onError: (error, variables, context) => {
      console.error('연결 삭제 실패:', error);
      toast.error('연결 삭제에 실패했습니다.');
      // 에러 시 롤백
      if (context?.previousConnections) {
        queryClient.setQueryData(['topics', topicId, 'connections'], context.previousConnections);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['topics', topicId, 'connections'] });
    },
  });

  // 노드 위치 업데이트
  const updateNodePositionMutation = useMutation({
    mutationFn: async ({
      nodeId,
      positionX,
      positionY,
    }: {
      nodeId: string;
      positionX: number;
      positionY: number;
    }) => {
      return updateNodePositionAPI(topicId, nodeId, { positionX, positionY });
    },
    onMutate: async ({ nodeId, positionX, positionY }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['topics', topicId, 'nodes'] });

      // 이전 데이터 스냅샷 저장
      const previousNodes = queryClient.getQueryData<IssueNode[]>(['topics', topicId, 'nodes']);

      // 낙관적 업데이트로 즉시 위치 변경
      if (previousNodes) {
        queryClient.setQueryData<IssueNode[]>(
          ['topics', topicId, 'nodes'],
          previousNodes.map((node) => {
            if (node.id !== nodeId) return node;
            return {
              ...node,
              positionX,
              positionY,
            };
          }),
        );
      }

      return { previousNodes };
    },
    onError: (error, variables, context) => {
      console.error('노드 위치 업데이트 실패:', error);
      toast.error('노드 위치 업데이트에 실패했습니다.');
      // 에러 시 롤백
      if (context?.previousNodes) {
        queryClient.setQueryData(['topics', topicId, 'nodes'], context.previousNodes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['topics', topicId, 'nodes'] });
    },
  });

  return {
    createConnection: createConnectionMutation.mutate,
    deleteConnection: deleteConnectionMutation.mutate,
    updateNodePosition: updateNodePositionMutation.mutate,
    isCreatingConnection: createConnectionMutation.isPending,
    isDeletingConnection: deleteConnectionMutation.isPending,
    isUpdatingNodePosition: updateNodePositionMutation.isPending,
  };
};
