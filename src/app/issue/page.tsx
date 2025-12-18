'use client';

import { useState } from 'react';
import Canvas from '@/app/issue/_components/canvas/Canvas';
import IdeaCard from '@/app/issue/_components/ideaCard/IdeaCard';
import Header from '@/app/issue/_components/layout/Header';
import { mockIdeasWithPosition } from '@/app/issue/data/mockIdeas';
import { mockCategories } from '@/app/issue/data/mockCategories';
import type { IdeaWithPosition, Position } from '@/app/issue/types/idea';
import type { Category } from '@/app/issue/types/category';
import TopicIssueLayout from '@/components/TopicIssueLayout';
import CategoryCard from './_components/category/categoryCard';

/**
 * 현재 이슈의 단계
 */
export type Phase = 'ideation' | 'voting' | 'discussion';

const IssuePage = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>('ideation');
  const [ideas, setIdeas] = useState<IdeaWithPosition[]>(mockIdeasWithPosition); // 아이디어 목록
  const [categories, setCategories] = useState<Category[]>(mockCategories); // 카테고리 목록

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
   * 카테고리 드래그 중 - 내부 아이디어도 함께 이동
   */
  const handleCategoryDrag = (
    categoryId: string,
    position: Position,
    delta: { dx: number; dy: number }
  ) => {
    // 카테고리 위치 업데이트
    setCategories((prevCategories) =>
      prevCategories.map((cat) => (cat.id === categoryId ? { ...cat, position } : cat)),
    );

    // 카테고리에 속한 아이디어들도 delta만큼 이동
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
      })
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

  return (
    <TopicIssueLayout
      header={
        <Header
          currentPhase={currentPhase}
          onPhaseChange={setCurrentPhase}
        />
      }
    >
      <Canvas onDoubleClick={handleCreateIdea}>
        {/* 카테고리들 (빈 프레임) */}
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            title={category.title}
            position={category.position}
            muted={category.muted}
            onPositionChange={handleCategoryPositionChange}
            onDrag={handleCategoryDrag}
          />
        ))}

        {/* 모든 아이디어 카드들 (카테고리 상관없이 Canvas 직계 자식) */}
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
            onPositionChange={handleIdeaPositionChange}
          />
        ))}
      </Canvas>
    </TopicIssueLayout>
  );
};

export default IssuePage;
