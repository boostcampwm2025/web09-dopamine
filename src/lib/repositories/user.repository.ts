import { prisma } from '@/lib/prisma';
import { PrismaTransaction } from '@/types/prisma';

type PrismaClientOrTx = PrismaTransaction | typeof prisma;

export async function createAnonymousUser(tx: PrismaTransaction, nickname: string) {
  return tx.user.create({
    data: {
      displayName: null,
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

export async function deleteUser(userId: string) {
  return prisma.$transaction(async (tx) => {
    // 인증 관련 삭제
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });

    // 멤버 삭제
    await tx.projectMember.deleteMany({ where: { userId } });
    await tx.issueMember.deleteMany({ where: { userId } });

    // 유저 삭제
    return tx.user.delete({
      where: { id: userId },
    });
  });
}

export async function updateUser(userId: string, data: { displayName?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { displayName: true },
  });
}

export async function updateUserWithIssueMemberNickname(userId: string, displayName: string) {
  return prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { displayName },
      select: { displayName: true },
    });

    await tx.issueMember.updateMany({
      where: { userId, deletedAt: null },
      data: { nickname: displayName },
    });

    return updatedUser;
  });
}

export async function getUserProviders(userId: string) {
  const accounts = await prisma.account.findMany({
    where: {
      userId: userId,
    },
    select: { provider: true },
  });

  return accounts.map((a) => a.provider);
}
