import { getServerSession } from 'next-auth';
import {
  createMockGetRequest,
  createMockParams,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';
import { DELETE, GET, PATCH } from '@/app/api/topics/[topicId]/route';
import { findTopicById } from '@/lib/repositories/topic.repository';
import { topicService } from '@/lib/services/topic.service';

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
jest.mock('next-auth');
jest.mock('next-auth/next');
jest.mock('@/lib/repositories/topic.repository');
jest.mock('@/lib/services/topic.service');

const mockedGetSession = getServerSession as jest.Mock;
const mockedFindTopicById = findTopicById as jest.MockedFunction<typeof findTopicById>;
const mockedUpdateTopicTitle = topicService.updateTopicTitle as jest.Mock;
const mockedDeleteTopic = topicService.deleteTopic as jest.Mock;

describe('/api/topics/[topicId]', () => {
  const topicId = 'topic-1';
  const mockUserId = 'user-123';
  const mockSession = { user: { id: mockUserId } };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // 기본적으로 인증된 상태로 설정 (PATCH, DELETE용)
    mockedGetSession.mockResolvedValue(mockSession);
  });

  describe('GET /api/topics/[topicId]', () => {
    it('topicId가 없으면 400 에러를 반환한다', async () => {
      const req = createMockGetRequest();
      const params = createMockParams({ topicId: '' });
      const response = await GET(req, params);
      await expectErrorResponse(response, 400, 'TOPIC_ID_REQUIRED');
    });

    it('성공적으로 토픽을 조회한다', async () => {
      const mockTopic = {
        id: topicId,
        title: 'Test Topic',
        projectId: 'project-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };
      mockedFindTopicById.mockResolvedValue(mockTopic as any);

      const req = createMockGetRequest();
      const params = createMockParams({ topicId });
      const response = await GET(req, params);
      const data = await expectSuccessResponse(response, 200);

      expect(data.id).toBe(topicId);
    });

    it('존재하지 않는 토픽을 조회하면 404 에러를 반환한다', async () => {
      mockedFindTopicById.mockResolvedValue(null);
      const req = createMockGetRequest();
      const params = createMockParams({ topicId });
      const response = await GET(req, params);
      await expectErrorResponse(response, 404, 'TOPIC_NOT_FOUND');
    });

    it('에러 발생 시 500 에러를 반환한다', async () => {
      mockedFindTopicById.mockRejectedValue(new Error('Database error'));
      const req = createMockGetRequest();
      const params = createMockParams({ topicId });
      const response = await GET(req, params);
      await expectErrorResponse(response, 500, 'TOPIC_FETCH_FAILED');
    });
  });

  describe('PATCH /api/topics/[topicId]', () => {
    const updatedTitle = 'Updated Topic Title';

    it('세션이 없으면 401 에러를 반환한다', async () => {
      mockedGetSession.mockResolvedValue(null); // 인증 실패
      const req = new Request(`http://localhost/api/topics/${topicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle }),
      }) as any;
      const params = createMockParams({ topicId });

      const response = await PATCH(req, params);
      await expectErrorResponse(response, 401, 'UNAUTHORIZED');
    });

    it('토픽 제목을 성공적으로 수정한다', async () => {
      const mockUpdatedTopic = { id: topicId, title: updatedTitle };
      mockedUpdateTopicTitle.mockResolvedValue(mockUpdatedTopic);

      const req = new Request(`http://localhost/api/topics/${topicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle }),
      }) as any;
      const params = createMockParams({ topicId });

      const response = await PATCH(req, params);
      const data = await expectSuccessResponse(response, 200);

      expect(mockedUpdateTopicTitle).toHaveBeenCalledWith({
        topicId,
        title: updatedTitle,
        userId: mockUserId,
      });
      expect(data.title).toBe(updatedTitle);
    });

    it('권한이 없는 유저가 수정을 시도하면 403 에러를 반환한다', async () => {
      mockedUpdateTopicTitle.mockRejectedValue(new Error('PERMISSION_DENIED'));
      const req = new Request(`http://localhost/api/topics/${topicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle }),
      }) as any;
      const params = createMockParams({ topicId });

      const response = await PATCH(req, params);
      await expectErrorResponse(response, 403, 'PERMISSION_DENIED');
    });

    it('존재하지 않는 토픽을 수정하려 하면 404 에러를 반환한다', async () => {
      mockedUpdateTopicTitle.mockRejectedValue(new Error('TOPIC_NOT_FOUND'));
      const req = new Request(`http://localhost/api/topics/${topicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle }),
      }) as any;
      const params = createMockParams({ topicId });

      const response = await PATCH(req, params);
      await expectErrorResponse(response, 404, 'TOPIC_NOT_FOUND');
    });

    it('수정 중 예상치 못한 에러 발생 시 500 에러를 반환한다', async () => {
      mockedUpdateTopicTitle.mockRejectedValue(new Error('Unknown DB Error'));
      const req = new Request(`http://localhost/api/topics/${topicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle }),
      }) as any;
      const params = createMockParams({ topicId });

      const response = await PATCH(req, params);
      await expectErrorResponse(response, 500, 'Unknown DB Error');
    });
  });

  describe('DELETE /api/topics/[topicId]', () => {
    const createDeleteReq = () =>
      new Request(`http://localhost/api/topics/${topicId}`, {
        method: 'DELETE',
      }) as any;

    it('세션이 없으면 401 에러를 반환한다', async () => {
      mockedGetSession.mockResolvedValue(null);
      const response = await DELETE(createDeleteReq(), createMockParams({ topicId }));
      await expectErrorResponse(response, 401, 'UNAUTHORIZED');
    });

    it('토픽을 성공적으로 삭제한다', async () => {
      mockedDeleteTopic.mockResolvedValue({ id: topicId });
      const response = await DELETE(createDeleteReq(), createMockParams({ topicId }));
      const data = await expectSuccessResponse(response, 200);

      expect(mockedDeleteTopic).toHaveBeenCalledWith(topicId, mockUserId);
      expect(data.id).toBe(topicId);
    });

    it('권한이 없으면 403 에러를 반환한다', async () => {
      mockedDeleteTopic.mockRejectedValue(new Error('PERMISSION_DENIED'));
      const response = await DELETE(createDeleteReq(), createMockParams({ topicId }));
      await expectErrorResponse(response, 403, 'PERMISSION_DENIED');
    });

    it('토픽이 존재하지 않으면 404 에러를 반환한다', async () => {
      mockedDeleteTopic.mockRejectedValue(new Error('TOPIC_NOT_FOUND'));
      const response = await DELETE(createDeleteReq(), createMockParams({ topicId }));
      await expectErrorResponse(response, 404, 'TOPIC_NOT_FOUND');
    });

    it('에러 발생 시 500 에러를 반환한다', async () => {
      mockedDeleteTopic.mockRejectedValue(new Error('Delete Fail'));
      const response = await DELETE(createDeleteReq(), createMockParams({ topicId }));
      await expectErrorResponse(response, 500, 'Delete Fail');
    });
  });
});
