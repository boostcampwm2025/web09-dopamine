/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { useTopicEvents } from '@/hooks/topic/use-topic-events';

// useQueryClient 모킹
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));
jest.mock('react-hot-toast');

describe('useTopicEvents', () => {
  let mockEventSource: any;
  let mockInvalidateQueries: jest.Mock;

  beforeEach(() => {
    // 1. QueryClient 모킹
    mockInvalidateQueries = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    // 2. EventSource 인스턴스 모킹
    mockEventSource = {
      onopen: null,
      onmessage: null,
      onerror: null,
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // 3. EventSource 생성자 모킹
    const mockEventSourceConstructor = jest.fn(() => mockEventSource);

    global.EventSource = mockEventSourceConstructor as unknown as typeof EventSource;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('연결 성공 시 isConnected가 true로 변경되어야 한다', () => {
    const { result } = renderHook(() => useTopicEvents({ topicId: 'test-topic-id' }));

    // 초기값 확인
    expect(result.current.isConnected).toBe(false);

    // onopen 이벤트 발생
    act(() => {
      mockEventSource.onopen();
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('에러 발생 시 isConnected가 false로 변경되어야 한다', () => {
    const { result } = renderHook(() => useTopicEvents({ topicId: 'test-topic-id' }));

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
      expect.any(Function),
    );

    // 등록된 이벤트 핸들러 가져오기
    const handler = mockEventSource.addEventListener.mock.calls.find(
      (call: any) => call[0] === SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED,
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

  it('마운트 시 beforeunload 리스너를 등록해야 한다', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');

    renderHook(() => useTopicEvents({ topicId: 'test-topic-id' }));

    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

    addSpy.mockRestore();
  });

  it('beforeunload 발생 시 EventSource를 닫아야 한다', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');

    renderHook(() => useTopicEvents({ topicId: 'test-topic-id' }));

    const handler = addSpy.mock.calls.find(
      (call) => call[0] === 'beforeunload',
    )![1] as EventListener;

    act(() => {
      handler(new Event('beforeunload'));
    });

    expect(mockEventSource.close).toHaveBeenCalled();

    addSpy.mockRestore();
  });

  it('언마운트 시 EventSource와 beforeunload 리스너를 정리해야 한다', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useTopicEvents({ topicId: 'test-topic-id' }));

    unmount();

    expect(mockEventSource.close).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

    removeSpy.mockRestore();
  });

  it('기본 메시지("connected") 수신 시 토스트를 띄워야 한다', () => {
    // 1. 훅 렌더링
    renderHook(() => useTopicEvents({ topicId: 'test-topic-id' }));

    // 2. 가짜 메시지 이벤트 데이터 생성
    const mockMessageEvent = {
      data: JSON.stringify({ type: 'connected' }),
    };

    // 3. onmessage 핸들러 실행
    act(() => {
      mockEventSource.onmessage(mockMessageEvent);
    });

    // 4. 검증: toast.success가 호출되었는지 확인
    expect(toast.success).toHaveBeenCalledWith('토픽에 연결되었습니다');
  });

  it('enabled가 false이면 EventSource를 연결하지 않아야 한다', () => {
    // EventSource 생성자 호출 기록 초기화
    (global.EventSource as unknown as jest.Mock).mockClear();

    renderHook(() => useTopicEvents({ topicId: 'test-topic-id', enabled: false }));

    // enabled: false이므로 생성자가 호출되지 않아야 함
    expect(global.EventSource).not.toHaveBeenCalled();
  });
});
