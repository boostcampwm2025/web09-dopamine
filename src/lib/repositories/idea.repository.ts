import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const ideaRepository = {
  async findByIssueId(issueId: string, userId?: string | null) {
    const ideas = await prisma.idea.findMany({
      where: {
        issueId,
        deletedAt: null,
      },
      select: {
        id: true,
        content: true,
        userId: true,
        agreeCount: true,
        disagreeCount: true,
        positionX: true,
        positionY: true,
        createdAt: true,

        category: {
          select: {
            id: true,
            title: true,
          },
        },

        comments: {
          where: { deletedAt: null },
          select: { id: true },
        },

        votes: {
          where: {
            ...(userId ? { userId } : {}),
            deletedAt: null,
          },
          select: {
            type: true, // AGREE | DISAGREE
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const members = await prisma.issueMember.findMany({
      where: {
        issueId,
        deletedAt: null,
      },
      select: {
        userId: true,
        nickname: true,
      },
    });

    const nicknameMap = new Map(members.map((member) => [member.userId, member.nickname]));

    return ideas.map((idea) => ({
      id: idea.id,
      content: idea.content,
      userId: idea.userId,
      categoryId: idea.category?.id || null,

      nickname: nicknameMap.get(idea.userId) ?? '알 수 없음',

      agreeCount: idea.agreeCount,
      disagreeCount: idea.disagreeCount,
      commentCount: idea.comments.length,
      positionX: idea.positionX,
      positionY: idea.positionY,

      myVote: idea.votes.length > 0 ? idea.votes[0].type : null,

      createdAt: idea.createdAt,
    }));
  },

  async findIdAndContentByIssueId(issueId: string) {
    return prisma.idea.findMany({
      where: {
        issueId,
        deletedAt: null,
      },
      select: {
        id: true,
        content: true,
      },
    });
  },

  async resetCategoriesByIssueId(issueId: string, tx: Prisma.TransactionClient = prisma) {
    return tx.idea.updateMany({
      where: { issueId },
      data: { categoryId: null, positionX: null, positionY: null },
    });
  },

  async create(data: {
    issueId: string;
    userId: string;
    content: string;
    positionX?: number;
    positionY?: number;
    categoryId?: string;
  }) {
    return prisma.idea.create({
      data: {
        issueId: data.issueId,
        userId: data.userId,
        content: data.content,
        positionX: data.positionX,
        positionY: data.positionY,
        categoryId: data.categoryId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },

  async softDelete(ideaId: string) {
    return prisma.idea.update({
      where: { id: ideaId },
      data: { deletedAt: new Date() },
    });
  },

  async update(
    ideaId: string,
    data: {
      positionX?: number;
      positionY?: number;
      categoryId?: string;
    },
  ) {
    const { positionX, positionY, categoryId } = data;
    return prisma.idea.update({
      where: { id: ideaId },
      data: {
        positionX,
        positionY,
        categoryId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },

  async findManyByIssueId(issueId: string, tx: Prisma.TransactionClient = prisma) {
    return tx.idea.findMany({
      where: { issueId, deletedAt: null },
      select: { id: true },
    });
  },

  async updateManyCategoriesByIds(
    ideaIds: string[],
    issueId: string,
    categoryId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.idea.updateMany({
      where: { id: { in: ideaIds }, issueId },
      data: { categoryId, positionX: null, positionY: null },
    });
  },
};
