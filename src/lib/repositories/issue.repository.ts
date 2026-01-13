import { PrismaTransaction } from '@/types/prisma';

export async function createIssue(tx: PrismaTransaction, title: string) {
  return tx.issue.create({
    data: { title },
  });
}
