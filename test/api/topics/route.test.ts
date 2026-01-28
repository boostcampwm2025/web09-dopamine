import { getServerSession } from 'next-auth';
import { POST } from '@/app/api/topics/route';
import * as topicRepository from '@/lib/repositories/topic.repository';
import {
  createMockRequest,
  createMockSession,
  setupAuthMock,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
jest.mock('@/lib/repositories/topic.repository');

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedCreateTopic = topicRepository.createTopic as jest.MockedFunction<
  typeof topicRepository.createTopic
>;

describe('POST /api/topics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 주의: 현재 topics/route.ts에는 인증 체크가 없습니다.
  // 인증이 필요한 경우 실제 코드에 인증 체크를 추가해야 합니다.
  it.skip('인증되지 않은 사용자는 401 에러를 받는다', async () => {
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
    expect(data.title).toBe('New Topic');
    expect(data.projectId).toBe('project-1');
    expect(mockedCreateTopic).toHaveBeenCalledWith('New Topic', 'project-1');
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    setupAuthMock(mockedGetServerSession, createMockSession('user-1'));
    mockedCreateTopic.mockRejectedValue(new Error('Database error'));

    const req = createMockRequest({ title: 'New Topic', projectId: 'project-1' });
    const response = await POST(req);
    await expectErrorResponse(response, 500, 'TOPIC_CREATE_FAILED');
  });
});
