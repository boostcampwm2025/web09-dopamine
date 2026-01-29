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

      // 카테고리 제목 중복을 제거하고, 동일한 제목에 속한 아이디어들을 하나로 병합하기 위해 Map 사용
      const uniqueCategoriesMap = new Map<string, string[]>();
      categoryPayloads.forEach((payload) => {
        const title = payload.title.trim();
        if (!title) return;
        const existingIdeaIds = uniqueCategoriesMap.get(title) || [];
        uniqueCategoriesMap.set(title, [...existingIdeaIds, ...payload.ideaIds]);
      });

      // 중복 제거된 카테고리
      const dedupedPayloads = Array.from(uniqueCategoriesMap.entries()).map(([title, ideaIds]) => ({
        title,
        ideaIds: Array.from(new Set(ideaIds)),
      }));

      const createdCategories = await categoryRepository.createManyForIssue(
        issueId,
        dedupedPayloads,
        tx as Prisma.TransactionClient,
      );

      const ideaCategoryMap = new Map<string, string>();
      const categoryToIdeaIds = new Map<string, string[]>();
      dedupedPayloads.forEach((category, index) => {
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
        // "기타" 카테고리가 이미 존재하는지 확인
        const existingOtherCategory = createdCategories.find((c) => c.title === '기타');

        let targetCategoryId: string;

        if (existingOtherCategory) {
          targetCategoryId = existingOtherCategory.id;
        } else {
          // "기타" 카테고리 생성
          const uncategorizedCategory = await categoryRepository.create(
            {
              issueId,
              title: '기타',
              positionX: 100 + createdCategories.length * 600,
              positionY: 100,
            },
            tx,
          );
          targetCategoryId = uncategorizedCategory.id;
          createdCategories.push(uncategorizedCategory);
        }

        // 미분류 아이디어들을 "기타" 카테고리에 할당
        await ideaRepository.updateManyCategoriesByIds(
          uncategorizedIdeaIds,
          issueId,
          targetCategoryId,
          tx,
        );

        // ideaCategoryMap 업데이트
        uncategorizedIdeaIds.forEach((ideaId) => {
          ideaCategoryMap.set(ideaId, targetCategoryId);
        });
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
