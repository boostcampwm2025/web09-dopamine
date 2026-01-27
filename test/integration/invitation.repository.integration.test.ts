import { prisma } from '@/lib/prisma';
import { InvitationRepository } from '@/lib/repositories/invitation.repository';

describe('invitation.repository 통합 테스트', () => {
  const created = {
    userIds: [] as string[],
    projectId: '' as string,
    invitationId: '' as string,
    inviteeId: '' as string,
    projectMemberId: '' as string,
  };

  beforeAll(async () => {
    // 역할: DB 연결이 정상인지 미리 확인해 테스트 중간 실패를 줄인다.
    await prisma.$queryRaw`SELECT 1`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    if (created.projectMemberId) {
      await prisma.projectMember.deleteMany({ where: { id: created.projectMemberId } });
      created.projectMemberId = '';
    }
    if (created.inviteeId) {
      await prisma.projectInvitee.deleteMany({ where: { id: created.inviteeId } });
      created.inviteeId = '';
    }
    if (created.invitationId) {
      await prisma.projectInvitation.deleteMany({ where: { id: created.invitationId } });
      created.invitationId = '';
    }
    if (created.projectId) {
      await prisma.project.deleteMany({ where: { id: created.projectId } });
      created.projectId = '';
    }
    if (created.userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: created.userIds } } });
      created.userIds = [];
    }
  });

  // update와 create를 트랜잭션 배열로 묶음.
  // 둘 중 하나만 성공하는 상황을 실제 DB에서 검증
  it('초대 수락 시 초대 상태 업데이트와 멤버 생성이 함께 처리된다', async () => {
    // 역할: 실제 DB에서 트랜잭션이 둘 다 성공시키는지 검증한다.

    // given
    // 오너 유저 생성
    const owner = await prisma.user.create({
      data: {
        email: `owner-${Date.now()}@example.com`,
        displayName: '오너',
        provider: null,
      },
    });

    // 초대 유저 생성
    const invitedUser = await prisma.user.create({
      data: {
        email: `user-${Date.now()}@example.com`,
        displayName: '초대유저',
        provider: null,
      },
    });

    created.userIds.push(owner.id, invitedUser.id);

    // 프로젝트 생성
    const project = await prisma.project.create({
      data: { title: `itest-project-${Date.now()}`, ownerId: owner.id },
    });
    created.projectId = project.id;

    // 초대장 및 초대자 생성
    const invitation = await InvitationRepository.createInvitation(project.id, 'token-1', [
      'invited@example.com',
    ]);
    created.invitationId = invitation.id;

    const invitee = await prisma.projectInvitee.findFirst({
      where: { invitationId: invitation.id },
    });
    if (!invitee) {
      throw new Error('invitee 생성 실패');
    }
    created.inviteeId = invitee.id;

    // when
    await InvitationRepository.createProjectMember(invitee.id, invitedUser.id, project.id);

    const updatedInvitee = await prisma.projectInvitee.findUnique({
      where: { id: invitee.id },
    });
    const projectMember = await prisma.projectMember.findFirst({
      where: { userId: invitedUser.id, projectId: project.id, deletedAt: null },
    });

    // then
    expect(updatedInvitee?.isAccepted).toBe(true);
    expect(updatedInvitee?.acceptedAt).toBeInstanceOf(Date);
    expect(projectMember).not.toBeNull();
    created.projectMemberId = projectMember?.id ?? '';
  });
});
