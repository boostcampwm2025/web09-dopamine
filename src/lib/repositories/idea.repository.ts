import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const ideaRepository = {
  async findByIssueId(issueId: string) {
    return prisma.idea.findMany({
      where: {
        issueId,
        deletedAt: null,
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
        votes: {
          where: { deletedAt: null },
        },
        _count: {
          select: {
            comments: {
              where: { deletedAt: null },
            },
          },
        }
      },
      orderBy: { createdAt: 'desc' },
    });
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

  async findById(ideaId: string) {
    return prisma.idea.findUnique({
      where: {
        id: ideaId,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
        comments: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
  },

  async findMyVote(ideaId: string, userId: string) {
    return prisma.vote.findFirst({
      where: {
        ideaId,
        userId,
        deletedAt: null,
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

  async findById(ideaId: string) {
    return prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            comments: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });
  },
};
