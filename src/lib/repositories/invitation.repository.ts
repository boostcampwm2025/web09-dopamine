import { prisma } from '../prisma';

export const InvitationRepository = {
  async createInvitation(projectId: string, token: string, emails: string[]) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 만료일 설정: 생성일 + 7일

    return await prisma.projectInvitation.create({
      data: {
        token,
        projectId,
        expiresAt,
        invitees: {
          create: emails.map((email) => ({
            email: email.trim(),
          })),
        },
      },
    });
  },

  async findInvitationByEmail(token: string, userEmail: string) {
    return await prisma.projectInvitation.findUnique({
      where: { token },
      include: {
        project: true,
        invitees: {
          where: { email: userEmail },
        },
      },
    });
  },

  async checkProjectMemberDuplicate(userId: string, projectId: string) {
    return await prisma.projectMember.findFirst({
      where: { userId, projectId, deletedAt: null },
    });
  },

  async createProjectMember(id: string, userId: string, projectId: string) {
    await prisma.$transaction([
      // ProjectInvitee의 isAccepted를 true로 변경
      prisma.projectInvitee.update({
        where: { id },
        data: {
          isAccepted: true,
          acceptedAt: new Date(),
        },
      }),
      // 실제 프로젝트 멤버로 등록
      prisma.projectMember.create({
        data: {
          projectId,
          userId,
        },
      }),
    ]);
  },
};
