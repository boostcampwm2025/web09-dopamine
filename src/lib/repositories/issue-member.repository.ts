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
        role: true,
        user: {
          select: {
            id: true,
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
          displayName: nickname,
        },
      },
      select: {
        id: true,
      },
    });
  },

  async findMemberByUserId(issueId: string, userId: string) {
    return prisma.issueMember.findFirst({
      where: {
        issueId,
        userId,
        deletedAt: null,
      },
      select: {
        role: true,
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  },
};
