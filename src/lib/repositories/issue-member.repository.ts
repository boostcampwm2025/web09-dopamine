import { IssueRole } from '@prisma/client';
import { PrismaTransaction } from '@/types/prisma';
import { prisma } from '../prisma';

export const issueMemberRepository = {
  async addIssueOwner(
    tx: PrismaTransaction,
    issueId: string,
    userId: string,
    role: IssueRole = IssueRole.OWNER,
  ) {
    return tx.issueMember.create({
      data: {
        issueId,
        userId,
        role,
      },
    });
  },

  async findMembersByIssueId(issueId: string) {
    return prisma.issueMember.findMany({
      where: {
        issueId,
        deletedAt: null,
      },
      select: {
        role: true,
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  },
};
