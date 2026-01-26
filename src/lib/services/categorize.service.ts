import type { Prisma } from '@prisma/client';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { prisma } from '@/lib/prisma';
import { categoryRepository } from '@/lib/repositories/category.repository';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { broadcast } from '@/lib/sse/sse-service';

interface CategoryPayload {
  title: string;
  ideaIds: string[];
}

interface CategorizeResult {
  categories: Array<{ id: string }>;
  ideaCategoryMap: Record<string, string>;
}

export const categorizeService = {
  async categorizeAndBroadcast(
    issueId: string,
    categoryPayloads: CategoryPayload[],
  ): Promise<CategorizeResult> {
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();

      await categoryRepository.softDeleteByIssueId(issueId, now, tx);

      await ideaRepository.resetCategoriesByIssueId(issueId, tx);

      const createdCategories = await categoryRepository.createManyForIssue(
        issueId,
        categoryPayloads,
        tx as Prisma.TransactionClient,
      );

      const ideaCategoryMap = new Map<string, string>();
      categoryPayloads.forEach((category, index) => {
        const categoryId = createdCategories[index]?.id;
        if (!categoryId) return;
        category.ideaIds.forEach((ideaId) => {
          ideaCategoryMap.set(ideaId, categoryId);
        });
      });

      await Promise.all(
        Array.from(ideaCategoryMap.entries()).map(([ideaId, categoryId]) =>
          tx.idea.updateMany({
            where: { id: ideaId, issueId },
            data: { categoryId, positionX: null, positionY: null },
          }),
        ),
      );

      // 미분류 아이디어 처리
      const allIdeas = await tx.idea.findMany({
        where: { issueId, deletedAt: null },
        select: { id: true },
      });

      const uncategorizedIdeaIds = allIdeas
        .filter((idea) => !ideaCategoryMap.has(idea.id))
        .map((idea) => idea.id);

      if (uncategorizedIdeaIds.length > 0) {
        // "미분류" 카테고리 생성
        const uncategorizedCategory = await tx.category.create({
          data: {
            issueId,
            title: '기타',
            positionX: 100 + createdCategories.length * 600,
            positionY: 100,
          },
        });

        // 미분류 아이디어들을 "미분류" 카테고리에 할당
        await tx.idea.updateMany({
          where: { id: { in: uncategorizedIdeaIds }, issueId },
          data: { categoryId: uncategorizedCategory.id, positionX: null, positionY: null },
        });

        // ideaCategoryMap 업데이트
        uncategorizedIdeaIds.forEach((ideaId) => {
          ideaCategoryMap.set(ideaId, uncategorizedCategory.id);
        });

        // createdCategories에 추가
        createdCategories.push(uncategorizedCategory);
      }

      return {
        categories: createdCategories,
        ideaCategoryMap: Object.fromEntries(ideaCategoryMap),
      };
    });

    // 브로드캐스팅
    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.CATEGORY_CREATED,
        data: { categoryIds: result.categories.map((category) => category.id) },
      },
    });

    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.IDEA_MOVED,
        data: { ideaIds: Object.keys(result.ideaCategoryMap) },
      },
    });

    return result;
  },
};
