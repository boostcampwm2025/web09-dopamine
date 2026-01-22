import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

type PrismaClientOrTx = Prisma.TransactionClient | typeof prisma;

export const LeaveRepository = {
  async getProjectOwnerId(projectId: string, tx?: Prisma.TransactionClient) {
    const client: PrismaClientOrTx = tx ?? prisma;

    return client.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      select: {
        ownerId: true,
      },
    });
  },

  async leaveProject(projectId: string, userId: string, tx?: Prisma.TransactionClient) {
    const client: PrismaClientOrTx = tx ?? prisma;

    const result = await client.projectMember.updateMany({
      where: {
        projectId,
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count;
  },
};
