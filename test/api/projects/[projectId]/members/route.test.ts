import { getServerSession } from 'next-auth';
import { POST } from '@/app/api/projects/[projectId]/members/route';
import { InvitationService } from '@/lib/services/invitation.service';
import {
  createMockParams,
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
jest.mock('@/lib/services/invitation.service', () => ({
  InvitationService: {
    acceptInvitation: jest.fn(),
  },
}));

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedAcceptInvitation = InvitationService.acceptInvitation as jest.MockedFunction<
  typeof InvitationService.acceptInvitation
>;

describe('POST /api/projects/[projectId]/members (프로젝트 초대 수락)', () => {
  const projectId = 'project-1';
  const userId = 'user-1';
  const userEmail = 'user@example.com';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증되지 않은 사용자는 401 에러를 받는다', async () => {
    setupAuthMock(mockedGetServerSession, null);

    const req = createMockRequest({ token: 'invitation-token' });
    const params = createMockParams({ projectId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 401, 'UNAUTHORIZED_USER');
  });

  it('이메일이 없는 세션은 401 에러를 받는다', async () => {
    setupAuthMock(mockedGetServerSession, createMockSession(userId, { user: { email: null } }));

    const req = createMockRequest({ token: 'invitation-token' });
    const params = createMockParams({ projectId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 401, 'UNAUTHORIZED_USER');
  });

  it('성공적으로 초대를 수락한다', async () => {
    const mockResult = { projectId, userId };
    const session = createMockSession(userId, { user: { email: userEmail } });

    setupAuthMock(mockedGetServerSession, session);
    mockedAcceptInvitation.mockResolvedValue(mockResult as any);

    const req = createMockRequest({ token: 'invitation-token' });
    const params = createMockParams({ projectId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 201);

    expect(data).toEqual(mockResult);
    expect(mockedAcceptInvitation).toHaveBeenCalledWith(
      'invitation-token',
      userEmail,
      session.user.id,
    );
  });

  it('에러 발생 시 400 에러를 반환한다', async () => {
    setupAuthMock(
      mockedGetServerSession,
      createMockSession(userId, { user: { email: userEmail } }),
    );
    mockedAcceptInvitation.mockRejectedValue(new Error('INVALID_TOKEN'));

    const req = createMockRequest({ token: 'invalid-token' });
    const params = createMockParams({ projectId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 400, 'INVALID_TOKEN');
  });
});
