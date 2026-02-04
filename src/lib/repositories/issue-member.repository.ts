import { IssueRole } from '@prisma/client';
import { prisma } from '../prisma';
import { createAnonymousUser } from './user.repository';
import { PrismaTransaction } from '@/types/prisma';

export const issueMemberRepository = {
  async joinLoggedInMember(issueId: string, userId: string, baseName: string) {
    return prisma.$transaction(async (tx) => {
      const nickname = baseName.trim() || '익명';

      const existingMember = await tx.issueMember.findFirst({
        where: { issueId, userId, deletedAt: null },
        select: { id: true, nickname: true },
      });

      if (existingMember) {
        return { userId, didJoin: false };
      }

      await this.addIssueMember(tx, {
        issueId,
        userId,
        nickname,
        role: IssueRole.MEMBER,
      });

      return { userId, didJoin: true };
    });
  },

  async joinAnonymousMember(issueId: string, nickname: string) {
    return prisma.$transaction(async (tx) => {
      const user = await createAnonymousUser(tx, nickname);
      await this.addIssueMember(tx, {
        issueId,
        userId: user.id,
        nickname,
        role: IssueRole.MEMBER,
      });

      return { userId: user.id, didJoin: true };
    });
  },

  async addIssueMember(
    tx: PrismaTransaction,
    {
      issueId,
      userId,
      nickname,
      role = IssueRole.MEMBER,
    }: {
      issueId: string;
      userId: string;
      nickname: string;
      role?: IssueRole;
    },
  ) {
    return tx.issueMember.create({
      data: {
        issueId,
        userId,
        nickname,
        role,
      },
    });
  },

  async findMembersByIssueId(issueId: string) {
    return prisma.issueMember.findMany({
      where: {
        issueId,
        deletedAt: null,
      },
      select: {
        userId: true,
        role: true,
        nickname: true,
        user: {
          select: {
            image: true,
          },
        },
      },
    });
  },

  async findMemberByUserId(issueId: string, userId: string | null) {
    if (!userId) return null;
    return prisma.issueMember.findFirst({
      where: {
        issueId,
        userId,
        deletedAt: null,
      },
      select: {
        userId: true,
        nickname: true,
        role: true,
      },
    });
  },

  async updateNickname(issueId: string, userId: string, nickname: string) {
    const member = await this.findMemberByUserId(issueId, userId);

    if (!member) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    return prisma.issueMember.updateMany({
      where: {
        issueId,
        userId,
      },
      data: {
        nickname,
      },
    });
  },
};
