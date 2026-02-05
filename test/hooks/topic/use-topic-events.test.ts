/**
 * @jest-environment jsdom
 */
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { useTopicEvents } from '@/hooks/topic/use-topic-events';

// 1. 외부 모듈 모킹
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('react-hot-toast');

describe('useTopicEvents', () => {
  let mockEventSource: any;
  let mockInvalidateQueries: jest.Mock;
  let mockRouter: any;
  const mockUserId = 'user-123';
  const topicId = 'test-topic-id';

  beforeEach(() => {
    // 1. QueryClient 모킹
    mockInvalidateQueries = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    // 2. Session 모킹
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: mockUserId } },
    });

    // 3. Router 모킹
    mockRouter = {
      refresh: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // 4. EventSource 인스턴스 모킹
    mockEventSource = {
      onopen: null,
      onmessage: null,
      onerror: null,
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // 5. EventSource 생성자 모킹
    global.EventSource = jest.fn(() => mockEventSource) as any;

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('연결 성공 시 isConnected가 true로 변경되어야 한다', () => {
    const { result } = renderHook(() => useTopicEvents({ topicId }));
    act(() => {
      mockEventSource.onopen();
    });
    expect(result.current.isConnected).toBe(true);
  });

  it('에러 발생 시 isConnected가 false로 변경되어야 한다', () => {
    const { result } = renderHook(() => useTopicEvents({ topicId }));
    act(() => {
      mockEventSource.onerror(new Event('error'));
    });
    expect(result.current.isConnected).toBe(false);
  });

  it('ISSUE_STATUS_CHANGED 이벤트 수신 시 쿼리를 무효화해야 한다', () => {
    renderHook(() => useTopicEvents({ topicId }));

    const handler = mockEventSource.addEventListener.mock.calls.find(
      (call: any) => call[0] === SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED,
    )[1];

    const mockEvent = { data: JSON.stringify({ issueId: 'issue-1' }) };
    act(() => {
      handler(mockEvent);
    });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['topics', topicId, 'issues'],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['issues', 'issue-1'],
    });
  });

  describe('ISSUE_DELETED 이벤트', () => {
    it('본인이 삭제한 이벤트(actorId === userId)인 경우 아무것도 하지 않아야 한다', () => {
      renderHook(() => useTopicEvents({ topicId }));

      const handler = mockEventSource.addEventListener.mock.calls.find(
        (call: any) => call[0] === SSE_EVENT_TYPES.ISSUE_DELETED,
      )[1];

      act(() => {
        handler({ data: JSON.stringify({ actorId: mockUserId, issueId: 'i1' }) });
      });

      expect(mockInvalidateQueries).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
      expect(mockRouter.refresh).not.toHaveBeenCalled();
    });

    it('타인이 삭제한 경우 쿼리를 무효화하고 토스트를 띄우며 페이지를 리프레시해야 한다', () => {
      renderHook(() => useTopicEvents({ topicId }));

      const handler = mockEventSource.addEventListener.mock.calls.find(
        (call: any) => call[0] === SSE_EVENT_TYPES.ISSUE_DELETED,
      )[1];

      act(() => {
        handler({ data: JSON.stringify({ actorId: 'other-user', issueId: 'issue-99' }) });
      });

      // 1. 쿼리 무효화 확인
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['topics', topicId] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['issues', 'issue-99'] });

      // 2. 피드백 확인
      expect(toast.error).toHaveBeenCalledWith('이슈가 삭제되었습니다.');

      // 3. 페이지 리프레시 확인
      expect(mockRouter.refresh).toHaveBeenCalled();
    });

    it('issueId가 없는 삭제 이벤트의 경우 이슈 상세 쿼리 무효화는 건너뛰어야 한다', () => {
      renderHook(() => useTopicEvents({ topicId }));

      const handler = mockEventSource.addEventListener.mock.calls.find(
        (call: any) => call[0] === SSE_EVENT_TYPES.ISSUE_DELETED,
      )[1];

      act(() => {
        handler({ data: JSON.stringify({ actorId: 'other-user', issueId: null }) });
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['topics', topicId] });
      expect(mockInvalidateQueries).not.toHaveBeenCalledWith({ queryKey: ['issues', null] });
    });
  });

  it('beforeunload 발생 시 EventSource를 닫아야 한다', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    renderHook(() => useTopicEvents({ topicId }));
    const handler = addSpy.mock.calls.find((call) => call[0] === 'beforeunload')![1] as any;

    act(() => {
      handler();
    });
    expect(mockEventSource.close).toHaveBeenCalled();
  });

  it('언마운트 시 리소스를 정리해야 한다', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useTopicEvents({ topicId }));
    unmount();
    expect(mockEventSource.close).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('기본 connected 메시지 수신 시 성공 토스트를 띄워야 한다', () => {
    renderHook(() => useTopicEvents({ topicId }));
    act(() => {
      mockEventSource.onmessage({ data: JSON.stringify({ type: 'connected' }) });
    });
    expect(toast.success).toHaveBeenCalledWith('토픽에 연결되었습니다');
  });

  it('enabled가 false이면 연결을 시도하지 않는다', () => {
    renderHook(() => useTopicEvents({ topicId, enabled: false }));
    expect(global.EventSource).not.toHaveBeenCalled();
  });
});
