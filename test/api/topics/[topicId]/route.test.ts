import { getServerSession } from 'next-auth';
import { GET, POST } from '@/app/api/topics/[topicId]/route';
import { findTopicById } from '@/lib/repositories/topic.repository';
import * as topicRepository from '@/lib/repositories/topic.repository';
import {
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  createMockSession,
  setupAuthMock,
  expectErrorResponse,
  expectSuccessResponse,
  testUnauthenticatedAccess,
} from '@test/utils/api-test-helpers';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
jest.mock('@/lib/repositories/topic.repository');

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedFindTopicById = findTopicById as jest.MockedFunction<typeof findTopicById>;
const mockedCreateTopic = topicRepository.createTopic as jest.MockedFunction<
  typeof topicRepository.createTopic
>;

describe('POST /api/topics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증되지 않은 사용자는 401 에러를 받는다', async () => {
    setupAuthMock(mockedGetServerSession, null);

    const req = createMockRequest({ title: 'New Topic', projectId: 'project-1' });
    const response = await POST(req);
    await expectErrorResponse(response, 401, 'UNAUTHORIZED');
  });

  it('title이 없으면 400 에러를 반환한다', async () => {
    setupAuthMock(mockedGetServerSession, createMockSession('user-1'));

    const req = createMockRequest({ projectId: 'project-1' });
    const response = await POST(req);
    await expectErrorResponse(response, 400, 'TITLE_REQUIRED');
  });

  it('projectId가 없으면 400 에러를 반환한다', async () => {
    setupAuthMock(mockedGetServerSession, createMockSession('user-1'));

    const req = createMockRequest({ title: 'New Topic' });
    const response = await POST(req);
    await expectErrorResponse(response, 400, 'PROJECT_ID_REQUIRED');
  });

  it('성공적으로 토픽을 생성한다', async () => {
    const mockTopic = { id: 'topic-1', title: 'New Topic', projectId: 'project-1' };

    setupAuthMock(mockedGetServerSession, createMockSession('user-1'));
    mockedCreateTopic.mockResolvedValue(mockTopic as any);

    const req = createMockRequest({ title: 'New Topic', projectId: 'project-1' });
    const response = await POST(req);
    const data = await expectSuccessResponse(response, 201);

    expect(data.id).toBe('topic-1');
    expect(mockedCreateTopic).toHaveBeenCalledWith('New Topic', 'project-1');
  });
});

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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedFindTopicById.mockResolvedValue(mockTopic as any);

    const req = createMockGetRequest();
    const params = createMockParams({ topicId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.id).toBe(topicId);
    expect(data.title).toBe('Test Topic');
  });

  it('존재하지 않는 토픽을 조회하면 404 에러를 반환한다', async () => {
    mockedFindTopicById.mockResolvedValue(null);

    const req = createMockGetRequest();
    const params = createMockParams({ topicId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 404, 'TOPIC_NOT_FOUND');
  });
});
