import { getServerSession } from 'next-auth';
import { GET, PATCH } from '@/app/api/projects/[projectId]/route';
import * as projectRepository from '@/lib/repositories/project.repository';
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
jest.mock('@/lib/repositories/project.repository');

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedGetProjectWithTopics = projectRepository.getProjectWithTopics as jest.MockedFunction<
  typeof projectRepository.getProjectWithTopics
>;
const mockedUpdateProject = projectRepository.updateProject as jest.MockedFunction<
  typeof projectRepository.updateProject
>;

describe('GET /api/projects/[projectId]', () => {
  const projectId = 'project-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증되지 않은 사용자는 401 에러를 받는다', async () => {
    await testUnauthenticatedAccess(
      GET,
      mockedGetServerSession,
      createMockParams({ projectId }),
      createMockGetRequest(),
    );
  });

  it('성공적으로 프로젝트를 조회한다', async () => {
    const mockProject = { id: projectId, title: 'Test Project', topics: [] };

    setupAuthMock(mockedGetServerSession, createMockSession(userId));
    mockedGetProjectWithTopics.mockResolvedValue(mockProject as any);

    const req = createMockGetRequest();
    const params = createMockParams({ projectId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.id).toBe(projectId);
    expect(mockedGetProjectWithTopics).toHaveBeenCalledWith(projectId);
  });

  it('존재하지 않는 프로젝트를 조회하면 404 에러를 반환한다', async () => {
    setupAuthMock(mockedGetServerSession, createMockSession(userId));
    mockedGetProjectWithTopics.mockResolvedValue(null);

    const req = createMockGetRequest();
    const params = createMockParams({ projectId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 404, 'PROJECT_NOT_FOUND');
  });
});

describe('PATCH /api/projects/[projectId]', () => {
  const projectId = 'project-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증되지 않은 사용자는 401 에러를 받는다', async () => {
    await testUnauthenticatedAccess(
      PATCH,
      mockedGetServerSession,
      createMockParams({ projectId }),
      createMockRequest({ title: 'Updated Title' }),
    );
  });

  it('성공적으로 프로젝트를 수정한다', async () => {
    const mockProject = { id: projectId, title: 'Updated Title', description: 'Updated Desc' };

    setupAuthMock(mockedGetServerSession, createMockSession(userId));
    mockedUpdateProject.mockResolvedValue(mockProject as any);

    const req = createMockRequest({ title: 'Updated Title', description: 'Updated Desc' });
    const params = createMockParams({ projectId });

    const response = await PATCH(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.title).toBe('Updated Title');
    expect(mockedUpdateProject).toHaveBeenCalledWith(projectId, 'Updated Title', 'Updated Desc');
  });
});
