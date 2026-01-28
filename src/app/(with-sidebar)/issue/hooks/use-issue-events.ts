import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import CloseIssueModal from '@/app/(with-sidebar)/issue/_components/close-issue-modal/close-issue-modal';
import { useModalStore } from '@/components/modal/use-modal-store';
import { MEMBER_ROLE } from '@/constants/issue';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { selectedIdeaQueryKey } from '@/hooks/issue';
import { deleteCloseModal, getIssueMember, reportActiveIdea } from '@/lib/api/issue';
import { useCommentWindowStore } from '../store/use-comment-window-store';
import { useIssueStore } from '../store/use-issue-store';

interface UseIssueEventsParams {
  issueId: string;
  userId: string;
  enabled?: boolean;
  topicId?: string | null;
}

interface UseIssueEventsReturn {
  isConnected: boolean;
  error: Event | null;
}

export function useIssueEvents({
  issueId,
  userId,
  enabled = true,
  topicId,
}: UseIssueEventsParams): UseIssueEventsReturn {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const connectionIdRef = useRef<string | null>(null); // 댓글창 연결 ID
  const selectedIdeaKey = useMemo(() => selectedIdeaQueryKey(issueId), [issueId]);

  const { setIsAIStructuring } = useIssueStore((state) => state.actions);
  const { setOnlineMemberIds } = useIssueStore((state) => state.actions);

  // 현재 사용자의 정보 조회
  const { data: currentUser } = useQuery({
    queryKey: ['issues', issueId, 'members', userId],
    queryFn: () => getIssueMember(issueId, userId),
    enabled: !!userId && enabled,
  });

  const isOwner = currentUser && currentUser.role === MEMBER_ROLE.OWNER;
  const isOwnerRef = useRef(isOwner);

  // isOwner 값이 변경될 때마다 ref 업데이트
  useEffect(() => {
    isOwnerRef.current = isOwner;
  }, [isOwner]);

  const SSE_REQ_URL = `/api/issues/${issueId}/events`;

  // 서버에 현재 활성화된 아이디어(댓글창)를 보고함
  const handleReportActiveIdea = async (ideaId: string | null) => {
    const connectionId = connectionIdRef.current;
    if (!connectionId) return;

    try {
      await reportActiveIdea(issueId, connectionId, ideaId);
    } catch (error) {
      console.error('Failed to report active idea state:', error);
    }
  };

  useEffect(() => {
    if (!enabled || !issueId || !userId) return;

    // EventSource 생성
    const eventSource = new EventSource(SSE_REQ_URL);
    eventSourceRef.current = eventSource;

    // 연결 성공
    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);

      // 재연결 시 전체 데이터 갱신
      const isReconnect = connectionIdRef.current !== null;
      if (isReconnect) {
        queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
      }
    };

    // 에러 발생
    eventSource.onerror = (event) => {
      setIsConnected(false);
      setError(event);

      toast.error('실시간 연결에 문제가 발생했습니다');
    };

    // 기본 메시지 핸들러 (connected 이벤트)
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'connected') {
        const connectionId = data.connectionId;
        connectionIdRef.current = connectionId;
        toast.success('연결되었습니다');

        // 연결 시점에 현재 열려있는 댓글창이 있다면 서버에 알림
        const activeIdeaId = useCommentWindowStore.getState().activeCommentId;
        if (activeIdeaId) {
          handleReportActiveIdea(activeIdeaId);
        }
      }
    };

    // 아이디어 이벤트 핸들러
    // 이벤트 실행 후 관련 쿼리 무효화 하여 데이터 갱신
    // 요청이 많아질 수록 안좋긴 한데, tanstack query의 플로우랑 잘 맞음...
    // 만약 SSE에 데이터를 직접 가져와서 setQueryData로 반영하는 방식으로 바꾸게 된다면 이 부분을 수정해야 함
    eventSource.addEventListener(SSE_EVENT_TYPES.IDEA_CREATED, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'ideas'] });
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.IDEA_MOVED, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'ideas'] });
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.IDEA_DELETED, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'ideas'] });
    });

    // 카테고리 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.CATEGORY_CREATED, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'categories'] });
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.CATEGORY_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'categories'] });
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.CATEGORY_MOVED, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'categories'] });
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.CATEGORY_DELETED, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'categories'] });
    });

    // AI 구조화 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.AI_STRUCTURING_STARTED, () => {
      setIsAIStructuring(true);
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.AI_STRUCTURING_COMPLETED, () => {
      setIsAIStructuring(false);
      toast.success('AI 구조화가 완료되었습니다.');
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.AI_STRUCTURING_FAILED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      const errorMessage = data.message || 'AI 구조화 중 오류가 발생했습니다.';

      setIsAIStructuring(false);

      toast.error(errorMessage);
    });

    // 투표 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.VOTE_CHANGED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      // 특정 아이디어의 투표만 갱신
      if (data.ideaId) {
        queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'ideas', data.ideaId] });
      }
    });

    // 댓글 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.COMMENT_CREATED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      // 특정 아이디어의 댓글 목록 및 commentCount 갱신
      if (data.ideaId) {
        queryClient.invalidateQueries({ queryKey: ['comments', issueId, data.ideaId] });

        if (typeof data.commentCount === 'number') {
          queryClient.setQueryData(['issues', issueId, 'ideas'], (old: any) => {
            if (!Array.isArray(old)) return old;
            return old.map((idea) =>
              idea.id === data.ideaId ? { ...idea, commentCount: data.commentCount } : idea,
            );
          });
        } else {
          queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'ideas'] });
        }
      }
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.COMMENT_UPDATED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      if (data.ideaId) {
        queryClient.invalidateQueries({ queryKey: ['comments', issueId, data.ideaId] });
      }
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.COMMENT_DELETED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      // 특정 아이디어의 댓글 목록 및 commentCount 갱신
      if (data.ideaId) {
        queryClient.invalidateQueries({ queryKey: ['comments', issueId, data.ideaId] });

        if (typeof data.commentCount === 'number') {
          queryClient.setQueryData(['issues', issueId, 'ideas'], (old: any) => {
            if (!Array.isArray(old)) return old;
            return old.map((idea) =>
              idea.id === data.ideaId ? { ...idea, commentCount: data.commentCount } : idea,
            );
          });
        } else {
          queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'ideas'] });
        }
      }
    });

    // 이슈 상태 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
      // 사이드바 이슈 목록도 갱신
      const targetTopicId = data.topicId || topicId;
      if (targetTopicId) {
        queryClient.invalidateQueries({ queryKey: ['topics', targetTopicId, 'issues'] });
      }
    });

    // 멤버 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.MEMBER_JOINED, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'members'] });
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.MEMBER_LEFT, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'members'] });
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.MEMBER_PRESENCE, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      // Zustand 스토어 업데이트
      setOnlineMemberIds(data.onlineUserIds || []);
    });

    // 채택된 아이디어 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.IDEA_SELECTED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      if (data.ideaId) {
        queryClient.setQueryData(selectedIdeaKey, data.ideaId);
      }
    });

    // 종료 모달 열기 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.CLOSE_MODAL_OPENED, () => {
      // 모든 사용자에게 모달 열기 (방장 여부는 모달 내부에서 확인)
      // ref를 사용하여 최신 isOwner 값을 참조
      const isOwnerValue = isOwnerRef.current;

      useModalStore.getState().openModal({
        title: '이슈 종료',
        content: React.createElement(CloseIssueModal, {
          issueId,
          isOwner: isOwnerValue,
        }),
        closeOnOverlayClick: isOwnerValue,
        hasCloseButton: isOwnerValue,
        modalType: 'close-issue',
        submitButtonText: '이슈 종료',
        onClose: async () => {
          // 모달 닫힘 시 다른 클라이언트에게 브로드캐스팅
          try {
            await deleteCloseModal(issueId);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            console.error('Failed to broadcast close modal:', errorMessage);
          }
        },
      });
    });

    // 종료 모달 닫기 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.CLOSE_MODAL_CLOSED, () => {
      // 모든 사용자에게 모달 닫기
      const { modalType } = useModalStore.getState();
      if (modalType === 'close-issue') {
        useModalStore.getState().closeModal();
      }
    });

    // 종료 모달 메모 업데이트 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.CLOSE_MODAL_MEMO_UPDATED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      // 메모 업데이트는 CloseIssueModal 컴포넌트에서 처리
      // 이벤트를 전달하기 위해 커스텀 이벤트 발생
      window.dispatchEvent(
        new CustomEvent('close-modal-memo-updated', {
          detail: { memo: data.memo || '' },
        }),
      );
    });

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      connectionIdRef.current = null;
      setIsAIStructuring(false);
    };
  }, [issueId, enabled, selectedIdeaKey, userId, setIsAIStructuring, topicId]);

  // 댓글창 상태 변경 감지 및 서버 보고
  useEffect(() => {
    const unsubscribe = useCommentWindowStore.subscribe((state) => {
      // 댓글창이 열리거나 닫힐 때 서버에 알림
      handleReportActiveIdea(state.activeCommentId);
    });

    return () => unsubscribe();
  }, [issueId]);

  return { isConnected, error };
}
