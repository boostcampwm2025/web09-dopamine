/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { useTopicEvents } from '@/hooks/topic/use-topic-events';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';

// useQueryClient 모킹
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

describe('useTopicEvents', () => {
  let mockEventSource: any;
  let mockInvalidateQueries: jest.Mock;

  beforeEach(() => {
    // QueryClient 모킹 설정
    mockInvalidateQueries = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    // EventSource 모킹
    mockEventSource = {
      onopen: null,
      onmessage: null,
      onerror: null,
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    global.EventSource = jest.fn(() => mockEventSource) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('연결 성공 시 isConnected가 true로 변경되어야 한다', () => {
    const { result } = renderHook(() =>
      useTopicEvents({ topicId: 'test-topic-id' })
    );

    // 초기값 확인
    expect(result.current.isConnected).toBe(false);

    // onopen 이벤트 발생
    act(() => {
      mockEventSource.onopen();
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('에러 발생 시 isConnected가 false로 변경되어야 한다', () => {
    const { result } = renderHook(() =>
      useTopicEvents({ topicId: 'test-topic-id' })
    );

    // 먼저 연결 상태로 만듦
    act(() => {
      mockEventSource.onopen();
    });
    expect(result.current.isConnected).toBe(true);

    // 에러 발생
    act(() => {
      mockEventSource.onerror();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('ISSUE_STATUS_CHANGED 이벤트 수신 시 쿼리를 무효화해야 한다', () => {
    renderHook(() => useTopicEvents({ topicId: 'test-topic-id' }));

    // addEventListener 호출 확인
    expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
      SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED,
      expect.any(Function)
    );

    // 등록된 이벤트 핸들러 가져오기
    const handler = mockEventSource.addEventListener.mock.calls.find(
      (call: any) => call[0] === SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED
    )[1];

    // 가짜 이벤트 데이터
    const mockEvent = {
      data: JSON.stringify({
        status: 'OPEN',
        issueId: 'test-issue-id',
        topicId: 'test-topic-id',
      }),
    };

    // 핸들러 실행
    act(() => {
      handler(mockEvent);
    });

    // 사이드바 이슈 목록 갱신 확인
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['topics', 'test-topic-id', 'issues'],
    });

    // 특정 이슈 데이터 갱신 확인
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['issues', 'test-issue-id'],
    });
  });

  it('언마운트 시 EventSource를 정리해야 한다', () => {
    const { unmount } = renderHook(() =>
      useTopicEvents({ topicId: 'test-topic-id' })
    );

    unmount();

    expect(mockEventSource.close).toHaveBeenCalled();
  });
});