import { IssueStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PrismaTransaction } from '@/types/prisma';

type PrismaClientOrTx = PrismaTransaction | typeof prisma;

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

export async function updateIssueStatus(
  issueId: string,
  status: IssueStatus,
  tx?: PrismaTransaction,
) {
  // 트랜잭션이 제공되면 그것을 사용하고, 그렇지 않으면 기본 prisma 클라이언트를 사용합니다.
  const client: PrismaClientOrTx = tx ?? prisma;

  return client.issue.update({
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
