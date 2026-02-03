import {
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';
import { DELETE } from '@/app/api/projects/[projectId]/members/[memberId]/route';
import { LeaveService } from '@/lib/services/leave.service';
import { getAuthenticatedUserId } from '@/lib/utils/api-auth';

jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({})),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

jest.mock('@/lib/services/leave.service');
jest.mock('@/lib/utils/api-auth');

describe('DELETE /api/projects/[projectId]/members/[memberId]', () => {
  const projectId = 'project-1';
  const memberId = 'member-1';
  const userId = 'user-1';

  // Mock 함수 타입 캐스팅
  const mockedGetAuthenticatedUserId = getAuthenticatedUserId as jest.Mock;
  const mockedLeaveProject = LeaveService.leaveProject as jest.Mock;

  // Next.js 15 스타일의 params (Promise)
  const mockParams = Promise.resolve({ projectId, memberId });

  beforeEach(() => {
    jest.clearAllMocks();
    // 기본적으로 인증 성공 상태로 설정
    mockedGetAuthenticatedUserId.mockResolvedValue({ userId, error: null });
  });

  it('인증되지 않은 사용자라면 401 에러를 반환한다', async () => {
    // Given: 인증 실패
    mockedGetAuthenticatedUserId.mockResolvedValue({
      userId: null,
      error: new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401 }),
    });

    const req = createMockRequest();

    // When
    const response = await DELETE(req, { params: mockParams });

    // Then
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('UNAUTHORIZED');
    expect(mockedLeaveProject).not.toHaveBeenCalled();
  });

  it('성공적으로 프로젝트를 탈퇴하면 200 응답을 반환한다', async () => {
    // Given: 서비스가 성공적으로 실행됨
    const mockResult = { success: true };
    mockedLeaveProject.mockResolvedValue(mockResult);

    const req = createMockRequest();

    // When
    const response = await DELETE(req, { params: mockParams });

    // Then
    const data = await expectSuccessResponse(response, 200);
    expect(data).toEqual(mockResult);
    expect(mockedLeaveProject).toHaveBeenCalledWith(projectId, userId);
  });

  it('존재하지 않는 프로젝트라면 404 에러를 반환한다', async () => {
    // Given
    mockedLeaveProject.mockRejectedValue(new Error('PROJECT_NOT_FOUND'));
    const req = createMockRequest();

    // When
    const response = await DELETE(req, { params: mockParams });

    // Then
    await expectErrorResponse(response, 404, 'PROJECT_NOT_FOUND');
  });

  it('프로젝트 소유자가 탈퇴하려 하면 403 에러를 반환한다', async () => {
    // Given
    mockedLeaveProject.mockRejectedValue(new Error('PROJECT_OWNER_CANNOT_LEAVE'));
    const req = createMockRequest();

    // When
    const response = await DELETE(req, { params: mockParams });

    // Then
    await expectErrorResponse(response, 403, 'PROJECT_OWNER_CANNOT_LEAVE');
  });

  it('프로젝트 멤버가 아니라면 404 에러를 반환한다', async () => {
    // Given
    mockedLeaveProject.mockRejectedValue(new Error('PROJECT_MEMBER_NOT_FOUND'));
    const req = createMockRequest();

    // When
    const response = await DELETE(req, { params: mockParams });

    // Then
    await expectErrorResponse(response, 404, 'PROJECT_MEMBER_NOT_FOUND');
  });

  it('기타 알 수 없는 에러 발생 시 500 에러를 반환한다', async () => {
    // Given
    mockedLeaveProject.mockRejectedValue(new Error('Unknown DB Error'));
    const req = createMockRequest();

    // When
    const response = await DELETE(req, { params: mockParams });

    // Then
    await expectErrorResponse(response, 500, 'LEAVE_PROJECT_FAILED');
  });
});
