import { prisma } from '@/lib/prisma';

export const userRepository = {
  async ensureUserExists(userId: string) {
    return prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `temp-${userId}@anonymous.local`,
        displayName: `익명-${userId.slice(0, 8)}`,
      },
    });
  },
};
