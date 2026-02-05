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

      // 기존 카테고리 soft delete + 아이디어 카테고리 리셋
      await categoryRepository.softDeleteByIssueId(issueId, now, tx);
      await ideaRepository.resetCategoriesByIssueId(issueId, tx);

      // 모든 아이디어 조회
      const allIdeas = await ideaRepository.findUncategorizedByIssueId(issueId, tx);

      // 카테고리 전처리 (미분류 처리 + 중복 제거 + 빈 카테고리 필터링)
      const dedupedPayloads = _processCategoryPayloads(categoryPayloads, allIdeas);

      // 카테고리 생성 및 아이디어 카테고리 업데이트
      const createdCategories = await categoryRepository.createManyForIssue(
        issueId,
        dedupedPayloads,
        tx as Prisma.TransactionClient,
      );

      // 반환값 구성을 위한 매핑
      const ideaCategoryMap = new Map<string, string>();
      dedupedPayloads.forEach((payload, index) => {
        const categoryId = createdCategories[index].id;
        payload.ideaIds.forEach((ideaId) => {
          ideaCategoryMap.set(ideaId, categoryId);
        });
      });

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

/**
 * 카테고리 데이터 전처리
 * 1. 미분류 아이디어 '기타' 카테고리 할당
 * 2. 카테고리 제목 중복 병합
 * 3. 빈 카테고리 필터링
 */
function _processCategoryPayloads(
  payloads: CategoryPayload[],
  allIdeas: { id: string }[],
) {
  // 1. 미분류 아이디어 처리
  const allIdeaIds = new Set(allIdeas.map((i) => i.id));
  const boundIdeaIds = new Set(payloads.flatMap((p) => p.ideaIds));
  const uncategorizedIdeaIds = [...allIdeaIds].filter((id) => !boundIdeaIds.has(id));

  if (uncategorizedIdeaIds.length > 0) {
    payloads.push({ title: '기타', ideaIds: uncategorizedIdeaIds });
  }

  // 2. 중복 제거
  const uniqueCategoriesMap = new Map<string, string[]>();
  payloads.forEach((payload) => {
    const title = payload.title.trim();
    if (!title) return;
    const existingIdeaIds = uniqueCategoriesMap.get(title) || [];
    uniqueCategoriesMap.set(title, [...existingIdeaIds, ...payload.ideaIds]);
  });

  // 3. 반환 (빈 카테고리 제외)
  return Array.from(uniqueCategoriesMap.entries())
    .map(([title, ideaIds]) => ({
      title,
      ideaIds: Array.from(new Set(ideaIds)),
    }))
    .filter((category) => category.ideaIds.length > 0);
}
