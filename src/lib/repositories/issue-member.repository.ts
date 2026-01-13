import { IssueRole } from '@prisma/client';
import { PrismaTransaction } from '@/types/prisma';

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
