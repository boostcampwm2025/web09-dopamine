import { GET } from '@/app/api/topics/[topicId]/route';
import { findTopicById } from '@/lib/repositories/topic.repository';
import {
  createMockGetRequest,
  createMockParams,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/repositories/topic.repository');

const mockedFindTopicById = findTopicById as jest.MockedFunction<typeof findTopicById>;

describe('GET /api/topics/[topicId]', () => {
  const topicId = 'topic-1';

  beforeEach(() => {
    jest.clearAllMocks();
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
