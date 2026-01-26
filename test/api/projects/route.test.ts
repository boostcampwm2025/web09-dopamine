import { GET, POST, DELETE } from '@/app/api/projects/route';
import { getAuthenticatedUserId } from '@/lib/utils/api-auth';
import * as projectRepository from '@/lib/repositories/project.repository';
import {
  createMockGetRequest,
  createMockRequest,
  createMockSession,
  expectErrorResponse,
  expectSuccessResponse,
  testUnauthenticatedAccess,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/utils/api-auth');
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
jest.mock('@/lib/repositories/project.repository');

const mockedGetAuthenticatedUserId = getAuthenticatedUserId as jest.MockedFunction<
  typeof getAuthenticatedUserId
>;
const mockedGetProjectsByOwnerId = projectRepository.getProjectsByOwnerId as jest.MockedFunction<
  typeof projectRepository.getProjectsByOwnerId
>;
const mockedGetProjectsByMemberId = projectRepository.getProjectsByMemberId as jest.MockedFunction<
  typeof projectRepository.getProjectsByMemberId
>;
const mockedCreateProject = projectRepository.createProject as jest.MockedFunction<
  typeof projectRepository.createProject
>;
const mockedDeleteProject = projectRepository.deleteProject as jest.MockedFunction<
  typeof projectRepository.deleteProject
>;

describe('GET /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증되지 않은 사용자는 401 에러를 받는다', async () => {
    const errorResponse = new Response(
      JSON.stringify({
        success: false,
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'UNAUTHORIZED' },
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );

    mockedGetAuthenticatedUserId.mockResolvedValue({
      userId: null,
      error: errorResponse as any,
    });

    const response = await GET();
    await expectErrorResponse(response, 401, 'UNAUTHORIZED');
  });

  it('성공적으로 프로젝트 목록을 조회한다', async () => {
    const userId = 'user-1';
    const mockOwnProjects = [{ id: 'project-1', title: 'My Project' }];
    const mockGuestProjects = [{ id: 'project-2', title: 'Guest Project' }];

    mockedGetAuthenticatedUserId.mockResolvedValue({
      userId,
      error: null,
    });
    mockedGetProjectsByOwnerId.mockResolvedValue(mockOwnProjects as any);
    mockedGetProjectsByMemberId.mockResolvedValue(mockGuestProjects as any);

    const response = await GET();
    const data = await expectSuccessResponse(response, 200);

    expect(data).toHaveLength(2);
    expect(mockedGetProjectsByOwnerId).toHaveBeenCalledWith(userId);
    expect(mockedGetProjectsByMemberId).toHaveBeenCalledWith(userId);
  });
});

describe('POST /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증되지 않은 사용자는 401 에러를 받는다', async () => {
    const errorResponse = new Response(
      JSON.stringify({
        success: false,
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'UNAUTHORIZED' },
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );

    mockedGetAuthenticatedUserId.mockResolvedValue({
      userId: null,
      error: errorResponse as any,
    });

    const req = createMockRequest({ title: 'New Project' });
    const response = await POST(req);
    await expectErrorResponse(response, 401, 'UNAUTHORIZED');
  });

  it('title이 없으면 400 에러를 반환한다', async () => {
    const userId = 'user-1';
    mockedGetAuthenticatedUserId.mockResolvedValue({ userId, error: null });

    const req = createMockRequest({});
    const response = await POST(req);
    await expectErrorResponse(response, 400, 'TITLE_REQUIRED');
  });

  it('성공적으로 프로젝트를 생성한다', async () => {
    const userId = 'user-1';
    const mockProject = { id: 'project-1', title: 'New Project' };

    mockedGetAuthenticatedUserId.mockResolvedValue({ userId, error: null });
    mockedCreateProject.mockResolvedValue(mockProject as any);

    const req = createMockRequest({ title: 'New Project', description: 'Description' });
    const response = await POST(req);
    const data = await expectSuccessResponse(response, 201);

    expect(data.id).toBe('project-1');
    expect(mockedCreateProject).toHaveBeenCalledWith('New Project', userId, 'Description');
  });
});

describe('DELETE /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증되지 않은 사용자는 401 에러를 받는다', async () => {
    const errorResponse = new Response(
      JSON.stringify({
        success: false,
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'UNAUTHORIZED' },
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );

    mockedGetAuthenticatedUserId.mockResolvedValue({
      userId: null,
      error: errorResponse as any,
    });

    const req = createMockRequest({ id: 'project-1' });
    const response = await DELETE(req);
    await expectErrorResponse(response, 401, 'UNAUTHORIZED');
  });

  it('id가 없으면 400 에러를 반환한다', async () => {
    const userId = 'user-1';
    mockedGetAuthenticatedUserId.mockResolvedValue({ userId, error: null });

    const req = createMockRequest({});
    const response = await DELETE(req);
    await expectErrorResponse(response, 400, 'ID_REQUIRED');
  });

  it('성공적으로 프로젝트를 삭제한다', async () => {
    const userId = 'user-1';
    const projectId = 'project-1';

    mockedGetAuthenticatedUserId.mockResolvedValue({ userId, error: null });
    mockedDeleteProject.mockResolvedValue({ id: projectId } as any);

    const req = createMockRequest({ id: projectId });
    const response = await DELETE(req);
    const data = await expectSuccessResponse(response, 200);

    expect(data.id).toBe(projectId);
    expect(mockedDeleteProject).toHaveBeenCalledWith(projectId, userId);
  });
});
