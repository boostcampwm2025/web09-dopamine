'use client';

import { useState } from 'react';
import Header from './header-temp';

export type Phase = 'ideation' | 'voting' | 'discussion';

export default function IssueHeader() {
  const [currentPhase, setCurrentPhase] = useState<Phase>('ideation');

  const handleAIStructure = () => {
    // TODO: AI 구조화 로직 (전역 상태나 이벤트 필요)
    console.log('AI 구조화 실행');
  };

  return (
    <Header
      currentPhase={currentPhase}
      onPhaseChange={setCurrentPhase}
      onAIStructure={handleAIStructure}
    />
  );
}
