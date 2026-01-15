import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { selectedIdeaQueryKey } from '@/app/(with-sidebar)/issue/hooks/queries/use-selected-idea-query';

interface UseIssueEventsParams {
  issueId: string;
  enabled?: boolean;
}

interface UseIssueEventsReturn {
  isConnected: boolean;
  error: Event | null;
}

export function useIssueEvents({
  issueId,
  enabled = true,
}: UseIssueEventsParams): UseIssueEventsReturn {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const selectedIdeaKey = useMemo(() => selectedIdeaQueryKey(issueId), [issueId]);

  const SSE_REQ_URL = `/api/issues/${issueId}/events`;

  useEffect(() => {
    if (!enabled || !issueId) return;

    // EventSource 생성
    const eventSource = new EventSource(SSE_REQ_URL);
    eventSourceRef.current = eventSource;

    // 연결 성공
    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);

      // 재연결 시 전체 데이터 갱신
      // 최초 연결시에도 실행되지만... 큰 문제 없을 듯
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
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
        toast.success('연결되었습니다');
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

    // 투표 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.VOTE_CHANGED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      // 특정 아이디어의 투표만 갱신
      if (data.ideaId) {
        queryClient.invalidateQueries({ queryKey: ['ideas', data.ideaId] });
      }
    });

    // 이슈 상태 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
    });

    // 멤버 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.MEMBER_JOINED, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'members'] });
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.MEMBER_LEFT, () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'members'] });
    });

    // 채택된 아이디어 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.IDEA_SELECTED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      if (data.ideaId) {
        queryClient.setQueryData(selectedIdeaKey, data.ideaId);
      }
    });

    // Cleanup
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [issueId, enabled, queryClient, selectedIdeaKey]);

  return { isConnected, error };
}
