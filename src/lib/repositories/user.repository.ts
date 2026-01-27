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
