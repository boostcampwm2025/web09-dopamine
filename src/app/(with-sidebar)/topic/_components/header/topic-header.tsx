'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TitleSkeleton } from '@/components/skeleton/skeleton';
import { useTopicDetailQuery } from '@/hooks/topic';
import { useSmartLoading } from '@/hooks/use-smart-loading';
import * as HS from '../../../issue/_components/header/header.styles';
import CreateIssueButton from '../create-issue-button/create-issue-button';
import * as S from './topic-header.styles';

export default function TopicHeader() {
  const params = useParams();
  const topicId = params.id as string;
  const { data: topic, isLoading } = useTopicDetailQuery(topicId);
  const showLoading = useSmartLoading(isLoading);

  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <Link href={`/project/${topic?.projectId || ''}`}>
          <HS.ButtonsWrapper>
            <Image
              src="/leftArrow.svg"
              alt="뒤로가기"
              width={18}
              height={18}
            />
          </HS.ButtonsWrapper>
        </Link>
        {showLoading ? <TitleSkeleton width="180px" /> : topic?.title}
      </S.LeftSection>
      <CreateIssueButton />
    </S.HeaderContainer>
  );
}
