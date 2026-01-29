import { prisma } from '@/lib/prisma';
import { InvitationRepository } from '@/lib/repositories/invitation.repository';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    projectInvitation: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    projectInvitee: {
      update: jest.fn(),
    },
    projectMember: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockedProjectInvitation =
  prisma.projectInvitation as jest.Mocked<typeof prisma.projectInvitation>;
const mockedProjectInvitee = prisma.projectInvitee as jest.Mocked<typeof prisma.projectInvitee>;
const mockedProjectMember = prisma.projectMember as jest.Mocked<typeof prisma.projectMember>;
const mockedTransaction = prisma.$transaction as jest.Mock;

describe('Invitation Repository 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('초대 생성 시 만료일을 7일 뒤로 설정하고 이메일을 trim한다', async () => {
    // 역할: 만료일/이메일 정규화가 정확해야 초대 링크가 올바르게 동작한다.
    jest.useFakeTimers();
    const base = new Date('2024-01-01T12:00:00Z');
    jest.setSystemTime(base);
    const expectedExpiresAt = new Date(base);
    expectedExpiresAt.setDate(expectedExpiresAt.getDate() + 7);

    mockedProjectInvitation.create.mockResolvedValue({ id: 'invite-1' } as any);

    await InvitationRepository.createInvitation('project-1', 'token-1', [
      ' user1@example.com ',
      'user2@example.com',
    ]);

    const call = mockedProjectInvitation.create.mock.calls[0][0];
    expect(call.data).toMatchObject({
      token: 'token-1',
      projectId: 'project-1',
    });
    expect(call.data.expiresAt).toEqual(expectedExpiresAt);
    expect(call.data.invitees.create).toEqual([
      { email: 'user1@example.com' },
      { email: 'user2@example.com' },
    ]);
  });

  it('토큰으로 초대 정보를 조회한다', async () => {
    // 역할: 초대 링크 화면에서 필요한 프로젝트/멤버 수 정보를 정확히 가져오는지 보장한다.
    mockedProjectInvitation.findUnique.mockResolvedValue({ token: 'token-1' } as any);

    await InvitationRepository.findInvitationByToken('token-1');

    expect(mockedProjectInvitation.findUnique).toHaveBeenCalledWith({
      where: { token: 'token-1' },
      select: {
        token: true,
        expiresAt: true,
        projectId: true,
        project: {
          select: {
            id: true,
            title: true,
            owner: {
              select: { name: true },
            },
            _count: {
              select: {
                projectMembers: {
                  where: { deletedAt: null },
                },
              },
            },
          },
        },
        invitees: {
          select: { email: true },
        },
      },
    });
  });

  it('토큰과 이메일로 초대 대상인지 확인한다', async () => {
    // 역할: 초대 대상 검증이 정확해야 권한 없는 사용자가 참여하지 않는다.
    mockedProjectInvitation.findUnique.mockResolvedValue({ token: 'token-1' } as any);

    await InvitationRepository.findInvitationByEmail('token-1', 'user@example.com');

    expect(mockedProjectInvitation.findUnique).toHaveBeenCalledWith({
      where: { token: 'token-1' },
      include: {
        project: true,
        invitees: {
          where: { email: 'user@example.com' },
        },
      },
    });
  });

  it('프로젝트 멤버 중복 여부를 확인한다', async () => {
    // 역할: 중복 가입을 막기 위한 사전 체크가 정확히 동작하는지 확인한다.
    mockedProjectMember.findFirst.mockResolvedValue({ id: 'pm-1' } as any);

    await InvitationRepository.checkProjectMemberDuplicate('user-1', 'project-1');

    expect(mockedProjectMember.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', projectId: 'project-1', deletedAt: null },
    });
  });

  it('초대 수락 시 초대 상태 업데이트와 멤버 생성을 트랜잭션으로 처리한다', async () => {
    // 역할: 초대 수락과 멤버 등록이 동시에 성공/실패하도록 원자성을 보장한다.
    const updatePromise = Promise.resolve({ id: 'invitee-1' });
    const createPromise = Promise.resolve({ id: 'pm-1' });

    mockedProjectInvitee.update.mockReturnValue(updatePromise as any);
    mockedProjectMember.create.mockReturnValue(createPromise as any);
    mockedTransaction.mockResolvedValue([updatePromise, createPromise]);

    await InvitationRepository.createProjectMember('invitee-1', 'user-1', 'project-1');

    expect(mockedProjectInvitee.update).toHaveBeenCalledWith({
      where: { id: 'invitee-1' },
      data: {
        isAccepted: true,
        acceptedAt: expect.any(Date),
      },
    });
    expect(mockedProjectMember.create).toHaveBeenCalledWith({
      data: { projectId: 'project-1', userId: 'user-1' },
    });
    expect(mockedTransaction).toHaveBeenCalledWith([updatePromise, createPromise]);
  });
});
