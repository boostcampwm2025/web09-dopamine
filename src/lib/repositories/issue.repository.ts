import { IssueStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PrismaTransaction } from '@/types/prisma';

export async function createIssue(tx: PrismaTransaction, title: string) {
  return tx.issue.create({
    data: { title },
  });
}

export async function findIssueById(issueId: string) {
  return prisma.issue.findFirst({
    where: {
      id: issueId,
      deletedAt: null,
    },
  });
}

export async function updateIssueStatus(issueId: string, status: IssueStatus) {
  return prisma.issue.update({
    where: { id: issueId },
    data: {
      status,
      closedAt: status === IssueStatus.CLOSE ? new Date() : null,
    },
    select: {
      id: true,
      status: true,
    },
  });
}
