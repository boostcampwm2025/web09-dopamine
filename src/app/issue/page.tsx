'use client';

import { useState } from 'react';
import Canvas from '@/app/issue/_components/canvas/Canvas';
import IdeaCard from '@/app/issue/_components/ideaCard/IdeaCard';
import Header from '@/app/issue/_components/layout/Header';
import { mockIdeasWithPosition } from '@/app/issue/data/mockIdeas';
import type { IdeaWithPosition, Position } from '@/app/issue/types/idea';
import TopicIssueLayout from '@/components/TopicIssueLayout';
import CategoryCard from './_components/category/categoryCard';

export type Phase = 'ideation' | 'voting' | 'discussion';

const IssuePage = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>('ideation');
  const [ideas, setIdeas] = useState<IdeaWithPosition[]>(mockIdeasWithPosition);

  /**
   * 아이디어 카드 위치 업데이트
   */
  const handleIdeaPositionChange = (id: string, position: Position) => {
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => (idea.id === id ? { ...idea, position } : idea)),
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
        <CategoryCard
          title="예시 카테고리"
          onItemDrop={() => {}}
        >
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              id={idea.id}
              content={idea.content} // 내용
              author={idea.author} // 작성자
              position={idea.position} // 위치
              isSelected={idea.isSelected} // 선택 여부
              isVotePhrase={currentPhase === 'voting' || currentPhase === 'discussion'}  // 투표 구간 여부
              agreeCount={idea.agreeCount} // 찬성 수
              disagreeCount={idea.disagreeCount} // 반대 수
              needDiscussion={idea.needDiscussion} // 토론 필요 여부
              editable={idea.editable} // 편집 가능 여부
              onPositionChange={handleIdeaPositionChange}
            />
          ))}
        </CategoryCard>
      </Canvas>
    </TopicIssueLayout>
  );
};

export default IssuePage;
