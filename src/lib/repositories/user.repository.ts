import { PrismaTransaction } from '@/types/prisma';

export async function createAnonymousUser(tx: PrismaTransaction, nickname: string) {
  return tx.user.create({
    data: {
      displayName: nickname,
      provider: null,
    },
  });
}
