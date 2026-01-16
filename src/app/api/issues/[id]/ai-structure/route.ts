import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { prisma } from '@/lib/prisma';
import { categoryRepository } from '@/lib/repositories/category-repository';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { sseManager } from '@/lib/sse/sse-manager';

interface CategoryPayload {
  title: string;
  ideaIds: string[];
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;
  const { categories } = await req.json();

  if (!Array.isArray(categories) || categories.length === 0) {
    return NextResponse.json({ message: 'categories are required.' }, { status: 400 });
  }

  const categoryPayloads: CategoryPayload[] = categories
    .filter((category) => category && typeof category.title === 'string')
    .map((category) => ({
      title: category.title.trim(),
      ideaIds: Array.isArray(category.ideaIds) ? category.ideaIds : [],
    }))
    .filter((category) => category.title.length > 0);

  if (categoryPayloads.length === 0) {
    return NextResponse.json({ message: 'AI categories are invalid.' }, { status: 422 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const now = new Date();

    await categoryRepository.softDeleteByIssueId(issueId, now, tx);

    await ideaRepository.resetCategoriesByIssueId(issueId, tx);

    const createdCategories = await categoryRepository.createManyForIssue(
      issueId,
      categoryPayloads,
      tx,
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

    return {
      categories: createdCategories,
      ideaCategoryMap: Object.fromEntries(ideaCategoryMap),
    };
  });

  sseManager.broadcast({
    issueId,
    event: {
      type: SSE_EVENT_TYPES.CATEGORY_CREATED,
      data: { categoryIds: result.categories.map((category) => category.id) },
    },
  });

  sseManager.broadcast({
    issueId,
    event: {
      type: SSE_EVENT_TYPES.IDEA_MOVED,
      data: { ideaIds: Object.keys(result.ideaCategoryMap) },
    },
  });

  return NextResponse.json(result);
}
