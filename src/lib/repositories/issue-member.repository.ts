import { IssueRole } from '@prisma/client';
import { PrismaTransaction } from '@/types/prisma';
import { prisma } from '../prisma';

export async function addIssueOwner(
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
}

export async function findMembersByIssueId(issueId: string) {
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
}
