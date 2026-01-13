import { PrismaTransaction } from '@/types/prisma';
import { prisma } from '@/lib/prisma';

type PrismaClientOrTx = PrismaTransaction | typeof prisma;

export async function findReportByIssueId(issueId: string, tx?: PrismaTransaction) {
  const client: PrismaClientOrTx = tx ?? prisma;

  return client.report.findFirst({
    where: {
      issueId,
      deletedAt: null,
    },
  });
}

export async function createReport(
  issueId: string,
  selectedIdeaId: string | null,
  memo: string | null,
  tx?: PrismaTransaction,
) {
  const client: PrismaClientOrTx = tx ?? prisma;

  return client.report.create({
    data: {
      issueId,
      selectedIdeaId: selectedIdeaId,
      memo: memo,
    },
  });
}
