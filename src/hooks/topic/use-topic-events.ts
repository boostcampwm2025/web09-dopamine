'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';

interface UseTopicEventsParams {
  topicId: string;
  enabled?: boolean;
}

interface UseTopicEventsReturn {
  isConnected: boolean;
  error: Event | null;
}

/**
 * 토픽 페이지에서 이슈 상태 변경 실시간으로 수신
 */
export function useTopicEvents({
  topicId,
  enabled = true,
}: UseTopicEventsParams): UseTopicEventsReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const SSE_REQ_URL = `/api/topics/${topicId}/events`;

  useEffect(() => {
    if (!enabled || !topicId) return;

    const eventSource = new EventSource(SSE_REQ_URL);
    eventSourceRef.current = eventSource;

    // 새로고침 시 연결 정리를 위한 beforeunload 핸들러
    const handleBeforeUnload = () => {
      eventSource.close();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onerror = (event) => {
      setIsConnected(false);
      setError(event);
    };

    // 기본 메시지 핸들러 (connected 이벤트)
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'connected') {
        toast.success('토픽에 연결되었습니다');
      }
    };

    // 이슈 상태 변경 이벤트 핸들러
    eventSource.addEventListener(SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      // 사이드바 이슈 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['topics', topicId, 'issues'] });
      // 특정 이슈 데이터 갱신
      if (data.issueId) {
        queryClient.invalidateQueries({ queryKey: ['issues', data.issueId] });
      }
    });

    eventSource.addEventListener(SSE_EVENT_TYPES.ISSUE_DELETED, (event) => {
      const data = JSON.parse((event as MessageEvent).data);

      queryClient.invalidateQueries({ queryKey: ['topics', topicId, 'issues'] });
      queryClient.invalidateQueries({ queryKey: ['topics', topicId, 'nodes'] });
      queryClient.invalidateQueries({ queryKey: ['topics', topicId, 'connections'] });

      if (data.issueId) {
        queryClient.invalidateQueries({ queryKey: ['issues', data.issueId] });
      }

      toast.error('이슈가 삭제되었습니다.');
      router.refresh();
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [topicId, enabled, queryClient]);

  return { isConnected, error };
}
