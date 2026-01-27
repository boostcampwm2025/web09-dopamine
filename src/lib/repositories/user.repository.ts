import { prisma } from '@/lib/prisma';
import { PrismaTransaction } from '@/types/prisma';

type PrismaClientOrTx = PrismaTransaction | typeof prisma;

export async function createAnonymousUser(tx: PrismaTransaction, nickname: string) {
  return tx.user.create({
    data: {
      displayName: nickname,
      provider: null,
    },
  });
}

export async function findUserById(userId: string, tx?: PrismaTransaction) {
  const client: PrismaClientOrTx = tx ?? prisma;

  return client.user.findUnique({
    where: {
      id: userId,
    },
    select: { email: true },
  });
}

export async function deleteUser(userId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. 유저가 소유한 프로젝트 ID 조회
    const ownedProjects = await tx.project.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const projectIds = ownedProjects.map((p) => p.id);

    // 2. 프로젝트에 연결된 Topic -> Issue 조회
    const topics = await tx.topic.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true },
    });
    const topicIds = topics.map((t) => t.id);

    const issues = await tx.issue.findMany({
      where: { topicId: { in: topicIds } },
      select: { id: true },
    });
    const issueIds = issues.map((i) => i.id);

    // 3. Issue 하위 레코드 삭제 
    const ideas = await tx.idea.findMany({
      where: { issueId: { in: issueIds } },
      select: { id: true },
    });
    const ideaIds = ideas.map((i) => i.id);

    const reports = await tx.report.findMany({
      where: { issueId: { in: issueIds } },
      select: { id: true },
    });
    const reportIds = reports.map((r) => r.id);

    await tx.wordCloud.deleteMany({ where: { reportId: { in: reportIds } } });
    await tx.report.deleteMany({ where: { issueId: { in: issueIds } } });
    await tx.vote.deleteMany({ where: { ideaId: { in: ideaIds } } });
    await tx.comment.deleteMany({ where: { ideaId: { in: ideaIds } } });
    await tx.idea.deleteMany({ where: { issueId: { in: issueIds } } });
    await tx.category.deleteMany({ where: { issueId: { in: issueIds } } });
    await tx.issueConnection.deleteMany({
      where: {
        OR: [
          { sourceIssueId: { in: issueIds } },
          { targetIssueId: { in: issueIds } },
        ],
      },
    });
    await tx.issueNode.deleteMany({ where: { issueId: { in: issueIds } } });
    await tx.issueMember.deleteMany({ where: { issueId: { in: issueIds } } });
    await tx.issue.deleteMany({ where: { topicId: { in: topicIds } } });
    await tx.topic.deleteMany({ where: { projectId: { in: projectIds } } });

    // 4. 프로젝트 관련 삭제
    const invitations = await tx.projectInvitation.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true },
    });
    const invitationIds = invitations.map((inv) => inv.id);

    await tx.projectInvitee.deleteMany({
      where: { invitationId: { in: invitationIds } },
    });
    await tx.projectInvitation.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await tx.projectMember.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await tx.project.deleteMany({ where: { ownerId: userId } });

    // 5. 유저가 직접 생성한 레코드 삭제 (다른 프로젝트에서)
    await tx.vote.deleteMany({ where: { userId } });
    await tx.comment.deleteMany({ where: { userId } });
    await tx.idea.deleteMany({ where: { userId } });
    await tx.issueMember.deleteMany({ where: { userId } });
    await tx.projectMember.deleteMany({ where: { userId } });

    // 6. 인증 관련 삭제
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });

    // 7. 유저 삭제
    return tx.user.delete({
      where: { id: userId },
    });
  });
}
