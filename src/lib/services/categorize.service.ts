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
      const categoryToIdeaIds = new Map<string, string[]>();
      categoryPayloads.forEach((category, index) => {
        const categoryId = createdCategories[index]?.id;
        if (!categoryId) return;
        category.ideaIds.forEach((ideaId) => {
          ideaCategoryMap.set(ideaId, categoryId);
          // 카테고리별 아이디어를 묶어 updateMany 호출 횟수를 줄인다.
          const ideaIds = categoryToIdeaIds.get(categoryId);
          if (ideaIds) {
            ideaIds.push(ideaId);
          } else {
            categoryToIdeaIds.set(categoryId, [ideaId]);
          }
        });
      });

      await Promise.all(
        Array.from(categoryToIdeaIds.entries()).map(([categoryId, ideaIds]) =>
          ideaRepository.updateManyCategoriesByIds(ideaIds, issueId, categoryId, tx),
        ),
      );

      // 미분류 아이디어 처리
      const uncategorizedIdeas = await ideaRepository.findUncategorizedByIssueId(issueId, tx);
      const uncategorizedIdeaIds = uncategorizedIdeas.map((idea) => idea.id);

      if (uncategorizedIdeaIds.length > 0) {
        // "미분류" 카테고리 생성
        const uncategorizedCategory = await categoryRepository.create(
          {
            issueId,
            title: '기타',
            positionX: 100 + createdCategories.length * 600,
            positionY: 100,
          },
          tx,
        );

        // 미분류 아이디어들을 "미분류" 카테고리에 할당
        await ideaRepository.updateManyCategoriesByIds(
          uncategorizedIdeaIds,
          issueId,
          uncategorizedCategory.id,
          tx,
        );

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
