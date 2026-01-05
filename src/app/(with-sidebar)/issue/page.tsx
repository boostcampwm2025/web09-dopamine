'use client';

import { useEffect, useState } from 'react';
import Canvas from '@/app/(with-sidebar)/issue/_components/canvas/canvas';
import IdeaCard from '@/app/(with-sidebar)/issue/_components/idea-card/idea-card';
import { mockCategories } from '@/app/(with-sidebar)/issue/data/mock-categories';
import { mockIdeasWithPosition } from '@/app/(with-sidebar)/issue/data/mock-ideas';
import type { Category } from '@/app/(with-sidebar)/issue/types/category';
import type { IdeaWithPosition, Position } from '@/app/(with-sidebar)/issue/types/idea';
import CategoryCard from './_components/category/category-card';
import { calculateCategorySize, calculateGridPosition } from './utils/category-grid';

type Phase = 'ideation' | 'voting' | 'discussion';

const IssuePage = () => {
  const [ideas, setIdeas] = useState<IdeaWithPosition[]>(mockIdeasWithPosition); // 아이디어 목록
  const [categories, setCategories] = useState<Category[]>(mockCategories); // 카테고리 목록
  const [draggingCategoryId, setDraggingCategoryId] = useState<string | null>(null); // 드래그 중인 카테고리 ID
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
   * 카테고리 드래그 시작
   */
  const handleCategoryDragStart = (categoryId: string) => {
    setDraggingCategoryId(categoryId);
  };

  /**
   * 카테고리 드래그 종료
   */
  const handleCategoryDragEnd = () => {
    setDraggingCategoryId(null);
  };

  /**
   * 카테고리 드래그 중 - 내부 아이디어도 함께 이동
   */
  const handleCategoryDrag = (
    categoryId: string,
    position: Position,
    delta: { dx: number; dy: number },
  ) => {
    // 카테고리 위치 업데이트
    setCategories((prevCategories) =>
      prevCategories.map((cat) => (cat.id === categoryId ? { ...cat, position } : cat)),
    );

    // 카테고리에 속한 아이디어들도 동일한 delta만큼 이동
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => {
        if (idea.categoryId === categoryId && idea.position) {
          return {
            ...idea,
            position: {
              x: idea.position.x + delta.dx,
              y: idea.position.y + delta.dy,
            },
          };
        }
        return idea;
      }),
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
    // 먼저 각 카테고리에 할당될 아이디어 개수 파악
    const ideasPerCategory = ideas.reduce(
      (acc, idea, index) => {
        const categoryIndex = index % 3;
        const categoryId = newCategories[categoryIndex].id;
        acc[categoryId] = (acc[categoryId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // 카테고리별 인덱스 추적
    const categoryIndexTracker: Record<string, number> = {};

    const categorizedIdeas = ideas.map((idea, index) => {
      // 3개 카테고리에 순서대로 분배
      const categoryIndex = index % 3;
      const targetCategory = newCategories[categoryIndex];
      const categoryId = targetCategory.id;

      // 해당 카테고리 내에서 몇 번째 아이디어인지
      const indexInCategory = categoryIndexTracker[categoryId] || 0;
      categoryIndexTracker[categoryId] = indexInCategory + 1;

      // Grid 위치 계산 (카테고리 절대 좌표 + 해당 카테고리의 총 아이디어 개수)
      const totalInCategory = ideasPerCategory[categoryId];
      const targetPosition = calculateGridPosition(
        targetCategory.position,
        indexInCategory,
        totalInCategory,
      );

      return {
        ...idea,
        categoryId,
        position: targetPosition,
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
      {categories.map((category) => {
        // 카테고리에 속한 아이디어 수 계산
        const ideasInCategory = ideas.filter((idea) => idea.categoryId === category.id).length;
        // 동적 크기 계산
        const { width, height } = calculateCategorySize(ideasInCategory);

        return (
          <CategoryCard
            key={category.id}
            id={category.id}
            title={category.title}
            position={category.position}
            isMuted={category.isMuted}
            width={width}
            height={height}
            onPositionChange={handleCategoryPositionChange}
            onDrag={handleCategoryDrag}
            onDragStart={() => handleCategoryDragStart(category.id)}
            onDragEnd={handleCategoryDragEnd}
          />
        );
      })}

      {ideas.map((idea) => (
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
          isBeingDraggedByCategory={idea.categoryId === draggingCategoryId}
          onPositionChange={handleIdeaPositionChange}
        />
      ))}
    </Canvas>
  );
};

export default IssuePage;
