import {
  createMockGetRequest,
  createMockParams,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';
import { GET, PATCH } from '@/app/api/topics/[topicId]/route';
import { findTopicById } from '@/lib/repositories/topic.repository';
import { topicService } from '@/lib/services/topic.service';

jest.mock('@/lib/repositories/topic.repository');
jest.mock('@/lib/services/topic.service');

const mockedFindTopicById = findTopicById as jest.MockedFunction<typeof findTopicById>;

describe('/api/topics/[topicId]', () => {
  describe('GET /api/topics/[topicId]', () => {
    const topicId = 'topic-1';

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, 'error').mockImplementation(() => {}); // 500 에러 로그 숨김
    });

    it('topicId가 없으면 400 에러를 반환한다', async () => {
      // Given: 빈 문자열 ID
      const req = createMockGetRequest();
      const params = createMockParams({ topicId: '' });

      // When
      const response = await GET(req, params);

      // Then
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
      expect(data.title).toBe('Test Topic');
      expect(data.projectId).toBe('project-1');
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
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
    const topicId = 'topic-1';
    const mockUserId = 'user-123';
    const updatedTitle = 'Updated Topic Title';

    // topicService.updateTopicTitle 모킹을 위한 변수
    const mockedUpdateTopicTitle = topicService.updateTopicTitle as jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('토픽 제목을 성공적으로 수정한다', async () => {
      // Given
      const mockUpdatedTopic = {
        id: topicId,
        title: updatedTitle,
        projectId: 'project-1',
      };
      mockedUpdateTopicTitle.mockResolvedValue(mockUpdatedTopic);

      const req = new Request(`http://localhost/api/topics/${topicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle, userId: mockUserId }),
      }) as any;
      const params = createMockParams({ topicId });

      // When
      const response = await PATCH(req, params);
      const data = await expectSuccessResponse(response, 200);

      // Then
      expect(data.title).toBe(updatedTitle);
      expect(mockedUpdateTopicTitle).toHaveBeenCalledWith({
        topicId,
        title: updatedTitle,
        userId: mockUserId,
      });
    });

    it('권한이 없는 유저가 수정을 시도하면 403 에러를 반환한다', async () => {
      // Given
      mockedUpdateTopicTitle.mockRejectedValue(new Error('PERMISSION_DENIED'));

      const req = new Request(`http://localhost/api/topics/${topicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle, userId: 'wrong-user' }),
      }) as any;
      const params = createMockParams({ topicId });

      // When
      const response = await PATCH(req, params);

      // Then
      await expectErrorResponse(response, 403, 'PERMISSION_DENIED');
    });

    it('존재하지 않는 토픽을 수정하려 하면 404 에러를 반환한다', async () => {
      // Given
      mockedUpdateTopicTitle.mockRejectedValue(new Error('TOPIC_NOT_FOUND'));

      const req = new Request(`http://localhost/api/topics/${topicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle, userId: mockUserId }),
      }) as any;
      const params = createMockParams({ topicId });

      // When
      const response = await PATCH(req, params);

      // Then
      await expectErrorResponse(response, 404, 'TOPIC_NOT_FOUND');
    });

    it('수정 중 예상치 못한 에러 발생 시 500 에러를 반환한다', async () => {
      // Given
      mockedUpdateTopicTitle.mockRejectedValue(new Error('Unknown DB Error'));

      const req = new Request(`http://localhost/api/topics/${topicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle, userId: mockUserId }),
      }) as any;
      const params = createMockParams({ topicId });

      // When
      const response = await PATCH(req, params);

      // Then
      await expectErrorResponse(response, 500, 'Unknown DB Error');
    });
  });
});
