import { IssueRole } from '@prisma/client';
import { PrismaTransaction } from '@/types/prisma';
import { prisma } from '../prisma';
import { createAnonymousUser } from './user.repository';

export const issueMemberRepository = {
  async createUniqueNicknameFromBase(
    tx: PrismaTransaction,
    issueId: string,
    baseName: string,
    excludeUserId?: string,
  ) {
    const trimmedBase = baseName.trim() || '익명';
    let uniqueNickname = trimmedBase;
    let suffix = 1;

    const findDuplicate = async (nickname: string) => {
      return tx.issueMember.findFirst({
        where: {
          issueId,
          nickname,
          deletedAt: null,
          ...(excludeUserId ? { NOT: { userId: excludeUserId } } : {}),
        },
        select: { id: true },
      });
    };

    while (await findDuplicate(uniqueNickname)) {
      uniqueNickname = `${trimmedBase}${suffix}`;
      suffix += 1;
    }

    return uniqueNickname;
  },

  async joinLoggedInMember(issueId: string, userId: string, baseName: string) {
    return prisma.$transaction(async (tx) => {
      const uniqueNickname = await this.createUniqueNicknameFromBase(
        tx,
        issueId,
        baseName,
        userId,
      );

      const existingMember = await tx.issueMember.findFirst({
        where: { issueId, userId, deletedAt: null },
        select: { id: true, nickname: true },
      });

      if (existingMember) {
        if (existingMember.nickname !== uniqueNickname) {
          await tx.issueMember.update({
            where: { id: existingMember.id },
            data: { nickname: uniqueNickname },
          });
        }
        return { userId, didJoin: false };
      }

      await this.addIssueMember(tx, {
        issueId,
        userId,
        nickname: uniqueNickname,
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
      },
    });
  },

  async findMemberByNickname(issueId: string, nickname: string) {
    return prisma.issueMember.findFirst({
      where: {
        issueId,
        nickname,
        deletedAt: null,
      },
      select: {
        id: true,
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
};
