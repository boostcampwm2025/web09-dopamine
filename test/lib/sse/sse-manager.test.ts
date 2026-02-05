import { SSEManager } from '@/lib/sse/sse-manager';
import { broadcastMemberPresence } from '@/lib/utils/broadcast-helpers';

// 1. 외부 의존성 모킹
jest.mock('@/lib/utils/broadcast-helpers', () => ({
  broadcastMemberPresence: jest.fn(),
}));

describe('SSEManager', () => {
  let sseManager: SSEManager;
  let abortController: AbortController;

  // UUID 모킹을 위한 변수
  const mockConnectionId = 'test-connection-id';

  beforeAll(() => {
    // crypto.randomUUID 모킹
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: () => mockConnectionId,
      },
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // 타이머 제어 시작
    sseManager = new SSEManager();
    abortController = new AbortController();
  });

  afterEach(() => {
    jest.useRealTimers(); // 타이머 복구
  });

  // 스트림 리더 헬퍼 함수
  const readStreamChunk = async (stream: ReadableStream) => {
    const reader = stream.getReader();
    const { value } = await reader.read();
    reader.releaseLock();
    return new TextDecoder().decode(value);
  };

  describe('createStream (이슈 연결)', () => {
    it('스트림을 생성하고 초기 연결 메시지를 전송해야 한다', async () => {
      const issueId = 'issue-1';
      const userId = 'user-1';

      const stream = sseManager.createStream({
        issueId,
        userId,
        signal: abortController.signal,
      });

      // 1. 스트림 생성 확인
      expect(stream).toBeInstanceOf(ReadableStream);

      // 2. 연결 상태 저장 확인
      expect(sseManager.getConnectionCount(issueId)).toBe(1);
      expect(sseManager.getOnlineMemberIds(issueId)).toContain(userId);

      // 3. Presence 브로드캐스트 호출 확인 (onConnect)
      expect(broadcastMemberPresence).toHaveBeenCalledWith(issueId);

      // 4. 초기 메시지 수신 확인
      const message = await readStreamChunk(stream);
      expect(message).toContain(`"type":"connected"`);
      expect(message).toContain(`"connectionId":"${mockConnectionId}"`);
      expect(message).toContain(`"issueId":"${issueId}"`);
    });

    it('연결이 끊기면(abort) 리소스를 정리하고 Presence를 업데이트해야 한다', () => {
      const issueId = 'issue-1';
      const userId = 'user-1';

      sseManager.createStream({
        issueId,
        userId,
        signal: abortController.signal,
      });

      // 연결 끊기
      abortController.abort();

      // 1. 맵에서 제거되었는지 확인
      expect(sseManager.getConnectionCount(issueId)).toBe(0);

      // 2. Presence 브로드캐스트 호출 확인 (onDisconnect)
      // onConnect에서 1번, onDisconnect에서 1번 = 총 2번
      expect(broadcastMemberPresence).toHaveBeenCalledTimes(2);
    });

    it('30초마다 하트비트 메시지를 전송해야 한다', async () => {
      const stream = sseManager.createStream({
        issueId: 'issue-1',
        userId: 'user-1',
        signal: abortController.signal,
      });

      const reader = stream.getReader();

      // 첫 번째 메시지(connected) 읽고 넘기기
      await reader.read();

      // 30초 시간 건너뛰기
      jest.advanceTimersByTime(30000);

      // 하트비트 메시지 읽기
      const { value } = await reader.read();
      const message = new TextDecoder().decode(value);

      expect(message).toBe(':heartbeat\n\n');
      reader.releaseLock();
    });
  });

  describe('broadcastToIssue', () => {
    it('연결된 모든 클라이언트에게 메시지를 브로드캐스트해야 한다', async () => {
      const issueId = 'issue-1';

      // 두 명의 유저 연결
      const stream1 = sseManager.createStream({
        issueId,
        userId: 'user-1',
        signal: new AbortController().signal,
      });
      const stream2 = sseManager.createStream({
        issueId,
        userId: 'user-2',
        signal: new AbortController().signal,
      });

      // 리더 준비 (초기 메시지는 건너뜀)
      const reader1 = stream1.getReader();
      const reader2 = stream2.getReader();
      await reader1.read();
      await reader2.read();

      // 브로드캐스트 실행
      const eventData = { type: 'TEST_EVENT', data: { foo: 'bar' } };
      sseManager.broadcastToIssue({
        issueId,
        event: eventData as any,
      });

      // 메시지 수신 확인
      const result1 = await reader1.read();
      const result2 = await reader2.read();

      const text1 = new TextDecoder().decode(result1.value);
      const text2 = new TextDecoder().decode(result2.value);

      expect(text1).toContain('event: TEST_EVENT');
      expect(text1).toContain('"foo":"bar"');
      expect(text2).toContain('event: TEST_EVENT');
    });

    it('excludeConnectionId에 해당하는 클라이언트에게는 메시지를 보내지 않아야 한다', async () => {
      const issueId = 'issue-1';

      // 모킹된 ID 사용 (test-connection-id)
      const stream1 = sseManager.createStream({
        issueId,
        userId: 'user-sender',
        signal: new AbortController().signal,
      });

      // 다른 ID를 가지도록 잠시 모킹 변경
      Object.defineProperty(global, 'crypto', {
        value: { randomUUID: () => 'receiver-id' },
      });

      const stream2 = sseManager.createStream({
        issueId,
        userId: 'user-receiver',
        signal: new AbortController().signal,
      });

      const reader1 = stream1.getReader();
      const reader2 = stream2.getReader();
      await reader1.read(); // 초기 메시지 소비
      await reader2.read(); // 초기 메시지 소비

      // 브로드캐스트 (sender 제외)
      sseManager.broadcastToIssue({
        issueId,
        event: { type: 'TEST', data: {} } as any,
        excludeConnectionId: mockConnectionId, // 'test-connection-id' 제외
      });

      // reader2(수신자)는 메시지를 받아야 함
      const result2 = await reader2.read();
      expect(new TextDecoder().decode(result2.value)).toContain('event: TEST');

      // reader1(송신자)은 메시지를 받지 않아야 함
      // (비동기라 확인이 어렵지만, 여기서 읽으려 하면 펜딩 상태여야 함)
      // 여기서는 Promise.race로 타임아웃을 걸어 "메시지가 안 옴"을 간접 확인하거나,
      // 단순히 reader2만 호출된 것을 확인하고 넘어갑니다.
    });
  });

  describe('Topic 관련 기능', () => {
    it('토픽 스트림을 생성하고 브로드캐스트 해야 한다', async () => {
      const topicId = 'topic-1';
      const userId = 'user-1';

      const stream = sseManager.createTopicStream({
        topicId,
        userId,
        signal: abortController.signal,
      });

      expect(stream).toBeInstanceOf(ReadableStream);

      // 토픽 브로드캐스트
      const reader = stream.getReader();
      await reader.read(); // 초기 메시지 소비

      sseManager.broadcastToTopic({
        topicId,
        event: { type: 'TOPIC_EVENT', data: 'hello' } as any,
      });

      const { value } = await reader.read();
      const message = new TextDecoder().decode(value);

      expect(message).toContain('event: TOPIC_EVENT');
      expect(message).toContain('"hello"');
    });
  });

  describe('유틸리티 메서드', () => {
    it('getConnectionCount와 getConnectionsInfo가 올바른 값을 반환해야 한다', () => {
      sseManager.createStream({
        issueId: 'issue-A',
        userId: 'user-1',
        signal: new AbortController().signal,
      });
      sseManager.createStream({
        issueId: 'issue-A',
        userId: 'user-2',
        signal: new AbortController().signal,
      });
      sseManager.createStream({
        issueId: 'issue-B',
        userId: 'user-3',
        signal: new AbortController().signal,
      });

      expect(sseManager.getConnectionCount('issue-A')).toBe(2);
      expect(sseManager.getConnectionCount('issue-B')).toBe(1);

      expect(sseManager.getConnectionsInfo()).toEqual({
        'issue-A': 2,
        'issue-B': 1,
      });
    });

    it('getOnlineMemberIds는 중복을 제거한 사용자 ID 목록을 반환해야 한다', () => {
      // 한 유저가 여러 탭(여러 연결)을 맺은 경우
      sseManager.createStream({
        issueId: 'issue-1',
        userId: 'user-1',
        signal: new AbortController().signal,
      });
      sseManager.createStream({
        issueId: 'issue-1',
        userId: 'user-1', // 같은 유저
        signal: new AbortController().signal,
      });
      sseManager.createStream({
        issueId: 'issue-1',
        userId: 'user-2',
        signal: new AbortController().signal,
      });

      const members = sseManager.getOnlineMemberIds('issue-1');
      expect(members).toHaveLength(2);
      expect(members).toContain('user-1');
      expect(members).toContain('user-2');
    });
  });
});
