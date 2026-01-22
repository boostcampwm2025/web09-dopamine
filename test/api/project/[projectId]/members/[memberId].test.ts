import { getServerSession } from 'next-auth';
import { DELETE } from '@/app/api/project/[projectId]/members/[memberId]/route';
import { LeaveService } from '@/lib/services/leave.service';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/lib/services/leave.service', () => ({
  LeaveService: {
    leaveProject: jest.fn(),
  },
}));

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedLeaveService = LeaveService as jest.Mocked<typeof LeaveService>;

describe('DELETE /api/project/[projectId]/members/[memberId] (프로젝트 탈퇴 API)', () => {
  const projectId = 'project-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createParams = (id: string, memberId: string) => ({
    params: Promise.resolve({ projectId: id, memberId }),
  });

  it('인증되지 않은 사용자가 요청하면 401 에러를 반환한다', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const response = await DELETE({} as Request, createParams(projectId, userId));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('프로젝트를 찾을 수 없으면 404 에러를 반환한다', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId } } as any);
    mockedLeaveService.leaveProject.mockRejectedValue(new Error('PROJECT_NOT_FOUND'));

    const response = await DELETE({} as Request, createParams(projectId, userId));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('PROJECT_NOT_FOUND');
  });

  it('프로젝트 소유자(Owner)가 탈퇴를 시도하면 403 에러를 반환한다', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId } } as any);
    mockedLeaveService.leaveProject.mockRejectedValue(new Error('PROJECT_OWNER_CANNOT_LEAVE'));

    const response = await DELETE({} as Request, createParams(projectId, userId));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error.code).toBe('PROJECT_OWNER_CANNOT_LEAVE');
  });

  it('프로젝트 멤버 목록에 사용자가 없으면 404 에러를 반환한다', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId } } as any);
    mockedLeaveService.leaveProject.mockRejectedValue(new Error('PROJECT_MEMBER_NOT_FOUND'));

    const response = await DELETE({} as Request, createParams(projectId, userId));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('PROJECT_MEMBER_NOT_FOUND');
  });

  it('성공적으로 탈퇴하면 200 상태 코드와 projectId를 반환한다', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId } } as any);
    mockedLeaveService.leaveProject.mockResolvedValue({ projectId });

    const response = await DELETE({} as Request, createParams(projectId, userId));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual({ projectId });
  });
});
