import { sseManager } from '@/lib/sse/sse-manager';
import * as sseService from '@/lib/sse/sse-service';

// 1. sseManager를 모킹합니다.
// 실제 SSEManager 로직은 sse-manager.test.ts에서 검증했으므로,
// 여기서는 '호출 여부'만 확인하기 위해 가짜 객체로 만듭니다.
jest.mock('@/lib/sse/sse-manager', () => ({
  sseManager: {
    broadcastToIssue: jest.fn(),
    broadcastToTopic: jest.fn(),
    getConnectionCount: jest.fn(),
    getConnectionsInfo: jest.fn(),
    getOnlineMemberIds: jest.fn(),
  },
}));

describe('SSE Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('broadcast', () => {
    it('sseManager.broadcastToIssue를 올바른 인자로 호출해야 한다', () => {
      const mockEvent = {
        issueId: 'issue-1',
        event: { type: 'TEST', data: 'hello' },
        excludeConnectionId: 'conn-1',
      } as any;

      sseService.broadcast(mockEvent);

      expect(sseManager.broadcastToIssue).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('broadcastToTopic', () => {
    it('sseManager.broadcastToTopic을 올바른 인자로 호출해야 한다', () => {
      const mockParams = {
        topicId: 'topic-1',
        event: { type: 'TOPIC_TEST', data: 'world' },
        excludeConnectionId: 'conn-2',
      } as any;

      sseService.broadcastToTopic(mockParams);

      expect(sseManager.broadcastToTopic).toHaveBeenCalledWith(mockParams);
    });
  });

  describe('getConnectionCount', () => {
    it('sseManager.getConnectionCount를 호출하고 결과를 반환해야 한다', () => {
      const issueId = 'issue-1';
      (sseManager.getConnectionCount as jest.Mock).mockReturnValue(5);

      const result = sseService.getConnectionCount(issueId);

      expect(sseManager.getConnectionCount).toHaveBeenCalledWith(issueId);
      expect(result).toBe(5);
    });
  });

  describe('getConnectionsInfo', () => {
    it('sseManager.getConnectionsInfo를 호출하고 결과를 반환해야 한다', () => {
      const mockInfo = { 'issue-1': 2, 'issue-2': 1 };
      (sseManager.getConnectionsInfo as jest.Mock).mockReturnValue(mockInfo);

      const result = sseService.getConnectionsInfo();

      expect(sseManager.getConnectionsInfo).toHaveBeenCalled();
      expect(result).toEqual(mockInfo);
    });
  });

  describe('getOnlineMemberIds', () => {
    it('sseManager.getOnlineMemberIds를 호출하고 결과를 반환해야 한다', () => {
      const issueId = 'issue-1';
      const mockMembers = ['user-1', 'user-2'];
      (sseManager.getOnlineMemberIds as jest.Mock).mockReturnValue(mockMembers);

      const result = sseService.getOnlineMemberIds(issueId);

      expect(sseManager.getOnlineMemberIds).toHaveBeenCalledWith(issueId);
      expect(result).toEqual(mockMembers);
    });
  });
});
