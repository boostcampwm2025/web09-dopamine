'use client';

import Image from 'next/image';
import {
  Badge,
  Border,
  Card,
  CandidatesValue,
  LeftStat,
  RightStat,
  StatLabel,
  Stats,
  Title,
  VotesValue,
} from './conclusion-section.styles';

type ConclusionSectionProps = {
  badgeText?: string;
  title: string;
  votes: number;
  candidates: number;
};

export default function ConclusionSection({
  title,
  votes,
  candidates,
}: ConclusionSectionProps) {
  return (
    <Card>
      <Badge>
        <Image
          src="/summary-crown.svg"
          alt="채택 아이콘"
          width={14}
          height={14}
        />
        <span>Selected Idea</span>
      </Badge>
      <Title>{title}</Title>
      <Stats>
        <LeftStat>
          <VotesValue>{votes}</VotesValue>
          <StatLabel>Votes</StatLabel>
        </LeftStat>
        <Border />
        <RightStat>
          <CandidatesValue>{candidates}</CandidatesValue>
          <StatLabel>Candidates</StatLabel>
        </RightStat>
      </Stats>
    </Card>
  );
}
