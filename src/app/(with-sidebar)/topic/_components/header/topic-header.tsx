'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTopicDetailQuery } from '@/hooks/topic';
import CreateIssueButton from '../create-issue-button/create-issue-button';
import * as S from './topic-header.styles';

export default function TopicHeader() {
  const params = useParams();
  const topicId = params.id as string;
  const { data: topic } = useTopicDetailQuery(topicId);

  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <Link href={`/project/${topic?.projectId}`}>
          <Image
            src="/leftArrow.svg"
            alt="뒤로가기"
            width={18}
            height={18}
          />
        </Link>
        {topic?.title}
      </S.LeftSection>
      <CreateIssueButton />
    </S.HeaderContainer>
  );
}
