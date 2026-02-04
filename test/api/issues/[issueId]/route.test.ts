import {
  createMockGetRequest,
  createMockParams,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';
import { GET, PATCH } from '@/app/api/issues/[issueId]/route';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { issueService } from '@/lib/services/issue.service';
import { broadcast, broadcastToTopic } from '@/lib/sse/sse-service';

jest.mock('@/lib/repositories/issue.repository');
jest.mock('@/lib/services/issue.service');
jest.mock('@/lib/sse/sse-service');

const mockedFindIssueById = findIssueById as jest.MockedFunction<typeof findIssueById>;
const mockedUpdateIssueTitle = issueService.updateIssueTitle as jest.Mock;
const mockedBroadcast = broadcast as jest.Mock;
const mockedBroadcastToTopic = broadcastToTopic as jest.Mock;

describe('api/issues/[issueId]', () => {
  const mockIssueId = 'issue-1';
  const mockUserId = 'user-123';
  const updatedTitle = 'Updated Issue Title';

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('GET /api/issues/[issueId]', () => {
    const mockIssue = {
      id: mockIssueId,
      title: 'Test Issue',
      status: 'SELECT',
      topicId: 'topic-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      closedAt: null,
    };
    it('이슈를 성공적으로 조회한다', async () => {
      mockedFindIssueById.mockResolvedValue(mockIssue as any);

      const req = createMockGetRequest();
      const params = createMockParams({ issueId: mockIssueId });

      const response = await GET(req, params);
      const data = await expectSuccessResponse(response, 200);

      expect(data.id).toBe(mockIssueId);
      expect(mockedFindIssueById).toHaveBeenCalledWith(mockIssueId);
    });

    it('존재하지 않는 이슈를 조회하면 404 에러를 반환한다', async () => {
      mockedFindIssueById.mockResolvedValue(null);

      const req = createMockGetRequest();
      const params = createMockParams({ issueId: mockIssueId });

      const response = await GET(req, params);
      await expectErrorResponse(response, 404, 'ISSUE_NOT_FOUND');
    });

    it('에러 발생 시 500 에러를 반환한다', async () => {
      mockedFindIssueById.mockRejectedValue(new Error('Database error'));

      const req = createMockGetRequest();
      const params = createMockParams({ issueId: mockIssueId });

      const response = await GET(req, params);
      await expectErrorResponse(response, 500, 'ISSUE_FETCH_FAILED');
    });
  });

  describe('PATCH /api/issues/[issueId]', () => {
    it('이슈 제목을 성공적으로 수정하고 SSE 이벤트를 전송한다', async () => {
      // Given
      const mockUpdatedIssue = {
        id: mockIssueId,
        title: updatedTitle,
        topicId: 'topic-1',
      };
      mockedUpdateIssueTitle.mockResolvedValue(mockUpdatedIssue);

      // JSON 바디를 포함한 가짜 요청 생성
      const req = new Request(`http://localhost/api/issues/${mockIssueId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle, userId: mockUserId }),
      }) as any;
      const params = createMockParams({ issueId: mockIssueId });

      // When
      const response = await PATCH(req, params);
      const data = await expectSuccessResponse(response, 200);

      // Then
      expect(mockedUpdateIssueTitle).toHaveBeenCalledWith({
        issueId: mockIssueId,
        title: updatedTitle,
        userId: mockUserId,
      });

      // 일반 브로드캐스트 확인
      expect(mockedBroadcast).toHaveBeenCalledWith({
        issueId: mockIssueId,
        event: {
          type: SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED,
          data: { title: updatedTitle, issueId: mockIssueId, topicId: 'topic-1' },
        },
      });

      // 토픽 브로드캐스트 확인 (topicId가 있는 경우)
      expect(mockedBroadcastToTopic).toHaveBeenCalledWith({
        topicId: 'topic-1',
        event: {
          type: SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED,
          data: { title: updatedTitle, issueId: mockIssueId, topicId: 'topic-1' },
        },
      });

      expect(data.title).toBe(updatedTitle);
    });

    it('topicId가 없는 경우 broadcastToTopic을 호출하지 않아야 한다', async () => {
      // Given
      const mockUpdatedIssueWithoutTopic = {
        id: mockIssueId,
        title: updatedTitle,
        topicId: null, // 토픽 없음
      };
      mockedUpdateIssueTitle.mockResolvedValue(mockUpdatedIssueWithoutTopic);

      const req = new Request(`http://localhost/api/issues/${mockIssueId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle, userId: mockUserId }),
      }) as any;
      const params = createMockParams({ issueId: mockIssueId });

      // When
      await PATCH(req, params);

      // Then
      expect(mockedBroadcast).toHaveBeenCalled();
      expect(mockedBroadcastToTopic).not.toHaveBeenCalled();
    });

    it('이슈를 찾을 수 없는 경우 404 에러를 반환한다', async () => {
      // Given
      mockedUpdateIssueTitle.mockRejectedValue(new Error('ISSUE_NOT_FOUND'));

      const req = new Request(`http://localhost/api/issues/${mockIssueId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle, userId: mockUserId }),
      }) as any;
      const params = createMockParams({ issueId: mockIssueId });

      // When
      const response = await PATCH(req, params);

      // Then
      await expectErrorResponse(response, 404, 'ISSUE_NOT_FOUND');
    });

    it('수정 권한이 없는 경우 403 에러를 반환한다', async () => {
      // Given
      mockedUpdateIssueTitle.mockRejectedValue(new Error('PERMISSION_DENIED'));

      const req = new Request(`http://localhost/api/issues/${mockIssueId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle, userId: mockUserId }),
      }) as any;
      const params = createMockParams({ issueId: mockIssueId });

      // When
      const response = await PATCH(req, params);

      // Then
      await expectErrorResponse(response, 403, 'PERMISSION_DENIED');
    });

    it('정의되지 않은 에러 발생 시 해당 메시지와 함께 500 에러를 반환한다', async () => {
      // Given
      const internalErrorMessage = 'DB_CONNECTION_ERROR';
      mockedUpdateIssueTitle.mockRejectedValue(new Error(internalErrorMessage));

      const req = new Request(`http://localhost/api/issues/${mockIssueId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle, userId: mockUserId }),
      }) as any;
      const params = createMockParams({ issueId: mockIssueId });

      // When
      const response = await PATCH(req, params);

      // Then
      await expectErrorResponse(response, 500, internalErrorMessage);
    });

    it('에러 객체가 아닌 예외 발생 시 기본 메시지와 함께 500 에러를 반환한다', async () => {
      // Given: Error 인스턴스가 아닌 문자열 등을 throw 하는 상황
      mockedUpdateIssueTitle.mockRejectedValue('Unknown String Error');

      const req = new Request(`http://localhost/api/issues/${mockIssueId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle, userId: mockUserId }),
      }) as any;
      const params = createMockParams({ issueId: mockIssueId });

      // When
      const response = await PATCH(req, params);

      // Then
      await expectErrorResponse(response, 500, 'ISSUE_UPDATE_FAILED');
    });
  });
});
