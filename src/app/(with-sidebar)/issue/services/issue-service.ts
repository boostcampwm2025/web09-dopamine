import { mockCategories } from '../data/mock-categories';
import { mockIdeasWithCategory } from '../data/mock-ideas';
import type { Idea, IdeaWithPosition } from '../types/idea';

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

export function getVoteCounts(idea: IdeaWithPosition) {
    const agree = idea.agreeCount ?? 0;
    const disagree = idea.disagreeCount ?? 0;
    const total = agree + disagree;
    const diff = Math.abs(agree - disagree);
    return { agree, disagree, total, diff };
}

export async function fetchIssueStatus(issueId: string) {
  try {
    const response = await fetch(`/api/issues/${issueId}/status`);
    if (response.ok) {
      const data = await response.json();
      return data.status;
    }
    return null;
  } catch (error) {
    console.error('이슈 상태 가져오기 실패:', error);
    return null;
  }
}

export async function categorizeIdeas(
  issueId: string,
  ideas: Array<{ id: string; content: string }>,
) {
  const payload = {
    issueId,
    ideas,
  };

  const response = await fetch(`/api/issues/${issueId}/categorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('AI 분류 실패');
  }

  const data = await response.json();
  const content = data.result?.message?.content;

  if (!content) {
    throw new Error('AI 응답 형식이 올바르지 않습니다.');
  }

  return JSON.parse(content);
}
