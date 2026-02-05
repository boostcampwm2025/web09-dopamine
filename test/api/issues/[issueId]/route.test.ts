import {
  createMockGetRequest,
  createMockParams,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';
import { DELETE, GET, PATCH } from '@/app/api/issues/[issueId]/route';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { issueService } from '@/lib/services/issue.service';
import { broadcast, broadcastToTopic } from '@/lib/sse/sse-service';
import { getIssueUserId } from '@/lib/utils/api-auth';

jest.mock('@/lib/auth', () => ({
  authOptions: {}, // 빈 객체로 대체
}));

// 1. 모킹 설정
jest.mock('@/lib/repositories/issue.repository');
jest.mock('@/lib/services/issue.service');
jest.mock('@/lib/sse/sse-service');
jest.mock('@/lib/utils/api-auth');

const mockedFindIssueById = findIssueById as jest.MockedFunction<typeof findIssueById>;
const mockedUpdateIssueTitle = issueService.updateIssueTitle as jest.Mock;
const mockedDeleteIssue = issueService.deleteIssue as jest.Mock;
const mockedBroadcast = broadcast as jest.Mock;
const mockedBroadcastToTopic = broadcastToTopic as jest.Mock;
const mockedGetIssueUserId = getIssueUserId as jest.Mock;

describe('api/issues/[issueId]', () => {
  const mockIssueId = 'issue-1';
  const mockUserId = 'user-123';
  const mockConnId = 'conn-789';
  const updatedTitle = 'Updated Title';

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetIssueUserId.mockResolvedValue(mockUserId);
  });

  describe('GET /api/issues/[issueId]', () => {
    it('이슈를 성공적으로 조회한다', async () => {
      mockedFindIssueById.mockResolvedValue({ id: mockIssueId, title: 'Test' } as any);
      const response = await GET(
        createMockGetRequest(),
        createMockParams({ issueId: mockIssueId }),
      );
      const data = await expectSuccessResponse(response, 200);
      expect(data.id).toBe(mockIssueId);
    });

    it('이슈가 없으면 404를 반환한다', async () => {
      mockedFindIssueById.mockResolvedValue(null);
      const response = await GET(
        createMockGetRequest(),
        createMockParams({ issueId: mockIssueId }),
      );
      await expectErrorResponse(response, 404, 'ISSUE_NOT_FOUND');
    });
  });

  describe('PATCH /api/issues/[issueId]', () => {
    const createPatchRequest = (body: object) =>
      new Request(`http://localhost/api/issues/${mockIssueId}`, {
        method: 'PATCH',
        headers: { 'x-sse-connection-id': mockConnId },
        body: JSON.stringify(body),
      }) as any;

    it('성공 시 제목을 수정하고 이슈/토픽 양쪽에 SSE를 전송한다 (topicId 존재)', async () => {
      const mockIssue = { id: mockIssueId, title: updatedTitle, topicId: 'topic-1' };
      mockedUpdateIssueTitle.mockResolvedValue(mockIssue);

      const response = await PATCH(
        createPatchRequest({ title: updatedTitle }),
        createMockParams({ issueId: mockIssueId }),
      );
      await expectSuccessResponse(response, 200);

      // 검증: 서비스 호출 시 서버에서 추출한 userId 사용 여부
      expect(mockedUpdateIssueTitle).toHaveBeenCalledWith({
        issueId: mockIssueId,
        title: updatedTitle,
        userId: mockUserId,
      });
      // 검증: SSE 브로드캐스트 (이슈 채널)
      expect(mockedBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ issueId: mockIssueId, excludeConnectionId: mockConnId }),
      );
      // 검증: SSE 브로드캐스트 (토픽 채널)
      expect(mockedBroadcastToTopic).toHaveBeenCalledWith(
        expect.objectContaining({ topicId: 'topic-1' }),
      );
    });

    it('topicId가 없는 경우 broadcastToTopic을 호출하지 않는다', async () => {
      mockedUpdateIssueTitle.mockResolvedValue({
        id: mockIssueId,
        title: updatedTitle,
        topicId: null,
      });
      await PATCH(
        createPatchRequest({ title: updatedTitle }),
        createMockParams({ issueId: mockIssueId }),
      );
      expect(mockedBroadcastToTopic).not.toHaveBeenCalled();
    });

    it('인증 실패(userId 없음) 시 401을 반환한다', async () => {
      mockedGetIssueUserId.mockResolvedValue(null);
      const response = await PATCH(
        createPatchRequest({ title: 'New' }),
        createMockParams({ issueId: mockIssueId }),
      );
      await expectErrorResponse(response, 401, 'USER_NOT_FOUND');
    });

    it('ISSUE_NOT_FOUND 에러 시 404를 반환한다', async () => {
      mockedUpdateIssueTitle.mockRejectedValue(new Error('ISSUE_NOT_FOUND'));
      const response = await PATCH(
        createPatchRequest({ title: 'New' }),
        createMockParams({ issueId: mockIssueId }),
      );
      await expectErrorResponse(response, 404, 'ISSUE_NOT_FOUND');
    });

    it('PERMISSION_DENIED 에러 시 403을 반환한다', async () => {
      mockedUpdateIssueTitle.mockRejectedValue(new Error('PERMISSION_DENIED'));
      const response = await PATCH(
        createPatchRequest({ title: 'New' }),
        createMockParams({ issueId: mockIssueId }),
      );
      await expectErrorResponse(response, 403, 'PERMISSION_DENIED');
    });

    it('에러 객체가 아닌 예외 발생 시 500 ISSUE_UPDATE_FAILED를 반환한다', async () => {
      mockedUpdateIssueTitle.mockRejectedValue('String Error');
      const response = await PATCH(
        createPatchRequest({ title: 'New' }),
        createMockParams({ issueId: mockIssueId }),
      );
      await expectErrorResponse(response, 500, 'ISSUE_UPDATE_FAILED');
    });
  });

  describe('DELETE /api/issues/[issueId]', () => {
    const createDeleteRequest = () =>
      new Request(`http://localhost/api/issues/${mockIssueId}`, {
        method: 'DELETE',
        headers: { 'x-sse-connection-id': mockConnId },
      }) as any;

    it('성공 시 삭제를 수행하고 양쪽에 SSE를 전송한다 (topicId 존재)', async () => {
      const mockIssue = { id: mockIssueId, topicId: 'topic-1' };
      mockedDeleteIssue.mockResolvedValue(mockIssue);

      const response = await DELETE(
        createDeleteRequest(),
        createMockParams({ issueId: mockIssueId }),
      );
      await expectSuccessResponse(response, 200);

      // 검증: 서비스 호출
      expect(mockedDeleteIssue).toHaveBeenCalledWith(mockIssueId, mockUserId);
      // 검증: SSE (이슈)
      expect(mockedBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          event: {
            type: SSE_EVENT_TYPES.ISSUE_DELETED,
            data: { issueId: mockIssueId, topicId: 'topic-1' },
          },
        }),
      );
      // 검증: SSE (토픽 - actorId 포함여부 확인)
      expect(mockedBroadcastToTopic).toHaveBeenCalledWith(
        expect.objectContaining({
          event: {
            type: SSE_EVENT_TYPES.ISSUE_DELETED,
            data: { issueId: mockIssueId, topicId: 'topic-1', actorId: mockUserId },
          },
        }),
      );
    });

    it('인증 실패 시 401을 반환한다', async () => {
      mockedGetIssueUserId.mockResolvedValue(null);
      const response = await DELETE(
        createDeleteRequest(),
        createMockParams({ issueId: mockIssueId }),
      );
      await expectErrorResponse(response, 401, 'USER_NOT_FOUND');
    });

    it('권한 부족 시 403을 반환한다', async () => {
      mockedDeleteIssue.mockRejectedValue(new Error('PERMISSION_DENIED'));
      const response = await DELETE(
        createDeleteRequest(),
        createMockParams({ issueId: mockIssueId }),
      );
      await expectErrorResponse(response, 403, 'PERMISSION_DENIED');
    });

    it('정의되지 않은 에러 발생 시 500 에러를 반환한다', async () => {
      mockedDeleteIssue.mockRejectedValue(new Error('DB_DOWN'));
      const response = await DELETE(
        createDeleteRequest(),
        createMockParams({ issueId: mockIssueId }),
      );
      await expectErrorResponse(response, 500, 'DB_DOWN');
    });

    it('에러 객체가 아닌 예외 발생 시 500 ISSUE_DELETE_FAILED를 반환한다', async () => {
      mockedDeleteIssue.mockRejectedValue('Critical Error');
      const response = await DELETE(
        createDeleteRequest(),
        createMockParams({ issueId: mockIssueId }),
      );
      await expectErrorResponse(response, 500, 'ISSUE_DELETE_FAILED');
    });
  });
});
