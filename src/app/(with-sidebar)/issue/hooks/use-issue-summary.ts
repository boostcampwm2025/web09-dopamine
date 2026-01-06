import { useCallback, useEffect, useState } from 'react';
import type { Idea } from '../types/idea';
import { mockCategories } from '../data/mock-categories';
import { mockIdeasWithCategory } from '../data/mock-ideas';

export default function useIssueSummary() {
  const [isCategorized, setIsCategorized] = useState(false);
  const [rawData, setRawData] = useState<Idea[]>([]);

  const fetchRawData = useCallback(async () => {
    try {
      /**
       * 1. DB fetch
       * 2. response -> setRawData(response.data)
       * 3. transform if needed
       *
       * 현재는 mockCategories와 mockIdeas를 조인하여 Idea[] 형태로 mock 세팅
       * key: categoryId
       * fields: id, author, content, category, agreeCount, disagreeCount
       */

      const categoriesById = mockCategories.reduce<Record<string, string>>((acc, cur) => {
        acc[cur.id] = cur.title;
        return acc;
      }, {});

      const mockedIdeas: Idea[] = mockIdeasWithCategory.map((idea, index) => {
        const category =
          (idea.categoryId && categoriesById[idea.categoryId]) || 'Uncategorized';

        return {
          id: idea.id,
          author: idea.author,
          content: idea.content,
          category,
          agreeCount: idea.agreeCount ?? 0,
          disagreeCount: idea.disagreeCount ?? 0,
          highlighted: index === 0, // mock: 첫 아이템을 대표로 강조
        };
      });

      setRawData(mockedIdeas);
    } catch (e) {
      // TODO: 에러 핸들링 정의 시 업데이트
    }
  }, []);

  useEffect(() => {
    fetchRawData();
  }, [fetchRawData]);

  const groupedData = rawData.reduce((acc: Record<string, Idea[]>, item: Idea) => {
    const { category } = item;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Idea[]>);

  const categorizedCards = mockCategories.map((category) => ({
    category,
    ideas: rawData.filter((idea) => idea.category === category.title),
  }));

  const handleCategorized = () => {
    if (isCategorized) return;
    setIsCategorized(true);
  };

  const handleUncategorized = () => {
    if (!isCategorized) return;
    setIsCategorized(false);
  };

  return {
    isCategorized,
    groupedData,
    rawData,
    categorizedCards,
    handleCategorized,
    handleUncategorized,
  };
}
