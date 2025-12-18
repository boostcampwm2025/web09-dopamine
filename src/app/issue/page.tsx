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
        {/* 캔버스 위 자유 배치 아이디어들 */}
        {ideas
          .filter((idea) => !idea.categoryId)
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

        {/* 카테고리들 */}
        {categories.map((category) => {
          const categoryIdeas = ideas.filter((idea) => idea.categoryId === category.id);
          return (
            <CategoryCard
              key={category.id}
              id={category.id}
              title={category.title}
              position={category.position}
              muted={category.muted}
              onItemDrop={() => {}}
              onPositionChange={handleCategoryPositionChange}
            >
              {categoryIdeas.map((idea) => (
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
                />
              ))}
            </CategoryCard>
          );
        })}
      </Canvas>
    </TopicIssueLayout>
  );
};

export default IssuePage;
