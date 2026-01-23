'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTopicDetailQuery } from '../../hooks/react-query/use-topic-query';
import CreateIssueButton from '../create-issue-button/create-issue-button';
import * as S from './topic-header.styles';

export default function TopicHeader() {
  const params = useParams();
  const topicId = params.id as string;
  const { data: topic } = useTopicDetailQuery(topicId);

  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <Image
          src="/leftArrow.svg"
          alt="뒤로가기"
          width={18}
          height={18}
        />
        {topic?.title}
      </S.LeftSection>
      <CreateIssueButton />
    </S.HeaderContainer>
  );
}
