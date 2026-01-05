'use client';

import { useEffect, useState } from 'react';
import Canvas from '@/app/(with-sidebar)/issue/_components/canvas/canvas';
import IdeaCard from '@/app/(with-sidebar)/issue/_components/idea-card/idea-card';
import { mockCategories } from '@/app/(with-sidebar)/issue/data/mock-categories';
import { mockIdeasWithPosition } from '@/app/(with-sidebar)/issue/data/mock-ideas';
import type { Category } from '@/app/(with-sidebar)/issue/types/category';
import type { IdeaWithPosition, Position } from '@/app/(with-sidebar)/issue/types/idea';
import CategoryCard from './_components/category/category-card';

type Phase = 'ideation' | 'voting' | 'discussion';

const IssuePage = () => {
  const [ideas, setIdeas] = useState<IdeaWithPosition[]>(mockIdeasWithPosition); // 아이디어 목록
  const [categories, setCategories] = useState<Category[]>(mockCategories); // 카테고리 목록
  const [currentPhase, setCurrentPhase] = useState<Phase>('ideation'); // 현재 단계

  /**
   * 아이디어 카드 위치 업데이트
   */
  const handleIdeaPositionChange = (id: string, position: Position) => {
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => (idea.id === id ? { ...idea, position } : idea)),
    );
  };

  /**
   * 카테고리 위치 업데이트
   */
  const handleCategoryPositionChange = (id: string, position: Position) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => (cat.id === id ? { ...cat, position } : cat)),
    );
  };

  /**
   * 새 아이디어 카드 생성
   */
  const handleCreateIdea = (position: Position) => {
    const newIdea: IdeaWithPosition = {
      id: `idea-${Date.now()}`,
      content: '',
      author: '나',
      categoryId: null,
      position,
      editable: true,
      isVotePhrase: false,
    };

    setIdeas((prevIdeas) => [...prevIdeas, newIdea]);
  };

  /**
   * AI 구조화 - 카테고리 생성 + 아이디어 자동 분류
   */
  const handleAIStructure = () => {
    // 1. 새 카테고리 생성 (임시로 3개)
    const newCategories: Category[] = [
      {
        id: 'cat-1',
        title: 'SNS 마케팅',
        position: { x: 100, y: 100 },
        isMuted: false,
      },
      {
        id: 'cat-2',
        title: '콘텐츠 제작',
        position: { x: 700, y: 100 },
        isMuted: false,
      },
      {
        id: 'cat-3',
        title: '커뮤니티 활동',
        position: { x: 500, y: 1000 },
        isMuted: false,
      },
    ];

    // 2. 아이디어 분류 로직 (임시로 단순 분배)
    const categorizedIdeas = ideas.map((idea, index) => {
      // 3개 카테고리에 순서대로 분배
      const categoryIndex = index % 3;
      const categoryId = newCategories[categoryIndex].id;

      return {
        ...idea,
        categoryId,
        position: null, // 카테고리 내부는 position 불필요 (CSS Grid가 처리)
      };
    });

    // 3. State 업데이트 (transition 트리거)
    setCategories(newCategories);
    setIdeas(categorizedIdeas);
  };

  // AI 구조화 이벤트 리스너
  useEffect(() => {
    const handleAIStructureEvent = () => {
      handleAIStructure();
    };

    window.addEventListener('aiStructure', handleAIStructureEvent);
    return () => window.removeEventListener('aiStructure', handleAIStructureEvent);
  }, [ideas]); // ideas가 변경될 때마다 리스너 재등록

  // Phase 변경 이벤트 리스너
  useEffect(() => {
    const handlePhaseChangeEvent = (e: CustomEvent<Phase>) => {
      setCurrentPhase(e.detail);
    };

    window.addEventListener('phaseChange', handlePhaseChangeEvent as EventListener);
    return () => window.removeEventListener('phaseChange', handlePhaseChangeEvent as EventListener);
  }, []);

  return (
    <Canvas onDoubleClick={handleCreateIdea}>
      {/* 카테고리들 - 내부에 아이디어 카드들을 children으로 전달 */}
      {categories.map((category) => {
        const categoryIdeas = ideas.filter((idea) => idea.categoryId === category.id);

        return (
          <CategoryCard
            key={category.id}
            id={category.id}
            title={category.title}
            position={category.position}
            isMuted={category.isMuted}
            onPositionChange={handleCategoryPositionChange}
          >
            {categoryIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                id={idea.id}
                content={idea.content}
                author={idea.author}
                categoryId={idea.categoryId}
                position={null} // 카테고리 내부는 position 불필요
                isSelected={idea.isSelected}
                isVotePhrase={currentPhase === 'voting' || currentPhase === 'discussion'}
                agreeCount={idea.agreeCount}
                disagreeCount={idea.disagreeCount}
                needDiscussion={idea.needDiscussion}
                editable={idea.editable}
              />
            ))}
          </CategoryCard>
        );
      })}

      {/* 자유 배치 아이디어들 (categoryId === null) */}
      {ideas
        .filter((idea) => idea.categoryId === null)
        .map((idea) => (
          <IdeaCard
            key={idea.id}
            id={idea.id}
            content={idea.content}
            author={idea.author}
            categoryId={idea.categoryId}
            position={idea.position}
            isSelected={idea.isSelected}
            isVotePhrase={currentPhase === 'voting' || currentPhase === 'discussion'}
            agreeCount={idea.agreeCount}
            disagreeCount={idea.disagreeCount}
            needDiscussion={idea.needDiscussion}
            editable={idea.editable}
            onPositionChange={handleIdeaPositionChange}
          />
        ))}
    </Canvas>
  );
};

export default IssuePage;
