import { mockCategories } from '../data/mock-categories';
import { mockIdeasWithCategory } from '../data/mock-ideas';
import type { Idea } from '../types/idea';

export async function getCategorizedIdeas() {
  // 실제 DB I/O 로직이 들어갈 자리

  const categoriesById = mockCategories.reduce<Record<string, string>>((acc, cur) => {
    acc[cur.id] = cur.title;
    return acc;
  }, {});

  const rawData: Idea[] = mockIdeasWithCategory.map((idea, index) => {
    const category = (idea.categoryId && categoriesById[idea.categoryId]) || 'Uncategorized';
    return {
      id: idea.id,
      author: idea.author,
      content: idea.content,
      category,
      agreeCount: idea.agreeCount ?? 0,
      disagreeCount: idea.disagreeCount ?? 0,
      highlighted: index === 0,
    };
  });

  const categorizedCards = mockCategories.map((category) => ({
    category,
    ideas: rawData.filter((idea) => idea.category === category.title),
  }));

  return { rawData, categorizedCards };
}

export async function getAllIdeas() {
  // 실제 DB I/O 로직이 들어갈 자리

  const { rawData } = await getCategorizedIdeas();
  return rawData as Idea[];
}