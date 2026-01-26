import { POST } from '@/app/api/projects/[projectId]/invitations/route';
import { InvitationRepository } from '@/lib/repositories/invitation.repository';
import {
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/repositories/invitation.repository', () => ({
  InvitationRepository: {
    createInvitation: jest.fn(),
  },
}));

const mockedCreateInvitation = InvitationRepository.createInvitation as jest.MockedFunction<
  typeof InvitationRepository.createInvitation
>;

describe('POST /api/projects/[projectId]/invitations', () => {
  const projectId = 'project-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 초대 토큰을 생성한다', async () => {
    const mockInvitation = {
      id: 'invitation-1',
      projectId,
      token: 'test-token-123',
      emails: ['user1@example.com', 'user2@example.com'],
    };

    mockedCreateInvitation.mockResolvedValue(mockInvitation as any);

    const req = createMockRequest({
      emails: ['user1@example.com', 'user2@example.com'],
    });
    const params = createMockParams({ projectId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 201);

    expect(data.id).toBe('invitation-1');
    expect(data.token).toBe('test-token-123');
    expect(mockedCreateInvitation).toHaveBeenCalled();
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedCreateInvitation.mockRejectedValue(new Error('Database error'));

    const req = createMockRequest({ emails: ['user1@example.com'] });
    const params = createMockParams({ projectId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 500, 'INVITATION_TOKEN_CREATE_FAILED');
  });
});
