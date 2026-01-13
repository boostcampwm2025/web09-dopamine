import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type CategoryPayload = {
  title: string;
  ideaIds: string[];
};

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

    await tx.category.updateMany({
      where: { issueId, deletedAt: null },
      data: { deletedAt: now },
    });

    await tx.idea.updateMany({
      where: { issueId },
      data: { categoryId: null, positionX: null, positionY: null },
    });

    const createdCategories = await Promise.all(
      categoryPayloads.map((category, index) =>
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

  return NextResponse.json(result);
}
