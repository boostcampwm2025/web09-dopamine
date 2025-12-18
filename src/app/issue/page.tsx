'use client';

import { useState } from 'react';
import Header from '@/app/issue/_components/layout/Header';
import TopicIssueLayout from '@/components/TopicIssueLayout';
import Canvas from '@/app/issue/_components/canvas/Canvas';
import IdeaCard from '@/app/issue/_components/ideaCard/IdeaCard';
import type { IdeaWithPosition, Position } from '@/app/issue/types/idea';
import { mockIdeasWithPosition } from '@/app/issue/data/mockIdeas';

export type Phase = 'ideation' | 'voting' | 'discussion';

const IssuePage = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>('ideation');
  const [ideas, setIdeas] = useState<IdeaWithPosition[]>(mockIdeasWithPosition);

  /**
   * 아이디어 카드 위치 업데이트
   */
  const handleIdeaPositionChange = (id: string, position: Position) => {
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) =>
        idea.id === id ? { ...idea, position } : idea
      )
    );
  };

  return (
    <TopicIssueLayout
      header={<Header currentPhase={currentPhase} onPhaseChange={setCurrentPhase} />}
    >
      <Canvas>
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            id={idea.id}
            content={idea.content}
            author={idea.author}
            position={idea.position}
            isSelected={idea.isSelected}
            isVotePhrase={idea.isVotePhrase}
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
