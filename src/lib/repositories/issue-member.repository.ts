import { IssueRole } from '@prisma/client';
import { PrismaTransaction } from '@/types/prisma';
import { prisma } from '../prisma';

export const issueMemberRepository = {
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
            displayName: true,
          },
        },
      },
    });
  },

  async findMemberByNickname(issueId: string, nickname: string) {
    return prisma.issueMember.findFirst({
      where: {
        issueId,
        deletedAt: null,
        user: {
          OR: [
            { displayName: nickname },
            { name: nickname },
          ],
        },
      },
      select: {
        id: true,
      },
    });
  },

  async findMemberByUserId(issueId: string, userId: string | null) {
    if (!userId) return null;
    const member = await prisma.issueMember.findFirst({
      where: {
        issueId,
        userId,
        deletedAt: null,
      },
      select: {
        userId: true,
        nickname: true,
        role: true,
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });
    if (!member) return null;
    return {
      userId: member.userId,
      nickname: member.nickname,
      role: member.role,
      displayName: member.user?.displayName ?? null,
    };
  },
};
