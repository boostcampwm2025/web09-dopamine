'use client';

import { useState } from 'react';
import Header from '@/app/issue/_components/layout/Header';
import TopicIssueLayout from '@/components/TopicIssueLayout';
import Canvas from '@/app/issue/_components/canvas/Canvas';

export type Phase = 'ideation' | 'voting' | 'discussion';

const IssuePage = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>('ideation');

  return (
    <TopicIssueLayout header={<Header currentPhase={currentPhase} onPhaseChange={setCurrentPhase} />}>
      <Canvas>
      </Canvas>
    </TopicIssueLayout>
  );
};

export default IssuePage;
