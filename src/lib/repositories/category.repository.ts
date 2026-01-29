import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * 카테고리 관련 DB 조작 로직
 */
export const categoryRepository = {
  async findByIssueId(issueId: string) {
    return prisma.category.findMany({
      where: {
        issueId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async findByTitle(issueId: string, title: string) {
    return prisma.category.findFirst({
      where: {
        issueId,
        title,
        deletedAt: null,
      },
    });
  },

  async softDeleteByIssueId(
    issueId: string,
    now: Date = new Date(),
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.category.updateMany({
      where: { issueId, deletedAt: null },
      data: { deletedAt: now },
    });
  },

  async createManyForIssue(
    issueId: string,
    categories: Array<{ title: string }>,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return Promise.all(
      categories.map((category, index) =>
        tx.category.create({
          data: {
            issueId,
            title: category.title,
            positionX: 100 + index * 600,
            positionY: 100,
          },
        }),
      ),
    );
  },

  async create(
    data: {
      issueId: string;
      title: string;
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
    },
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.category.create({
      data: {
        issueId: data.issueId,
        title: data.title,
        positionX: data.positionX,
        positionY: data.positionY,
        width: data.width,
        height: data.height,
      },
    });
  },

  async update(
    categoryId: string,
    data: {
      title?: string;
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
    },
  ) {
    return prisma.category.update({
      where: { id: categoryId },
      data: {
        title: data.title,
        positionX: data.positionX,
        positionY: data.positionY,
        width: data.width,
        height: data.height,
      },
    });
  },

  async softDelete(categoryId: string) {
    return prisma.category.update({
      where: { id: categoryId },
      data: { deletedAt: new Date() },
    });
  },
};
