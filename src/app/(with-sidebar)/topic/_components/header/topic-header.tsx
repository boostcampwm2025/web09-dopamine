'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CircleSkeleton, TextSkeleton, TitleSkeleton } from '@/components/skeleton/skeleton';
import { useTopicDetailQuery } from '@/hooks/topic';
import { useSmartLoading } from '@/hooks/use-smart-loading';
import * as HS from '../../../issue/_components/header/header.styles';
import CreateIssueButton from '../create-issue-button/create-issue-button';
import EditTopicButton from '../edit-topic-button/edit-topic-button';
import * as S from './topic-header.styles';

export default function TopicHeader() {
  const params = useParams();
  const topicId = params.id as string;
  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();
  const { data: topic, isLoading } = useTopicDetailQuery(topicId);
  const showLoading = useSmartLoading(isLoading);
  const showSessionLoading = useSmartLoading(sessionStatus === 'loading');

  const userName = session?.user?.displayName;
  const userImage = session?.user?.image;

  const handleProfileClick = () => {
    router.push('/mypage');
  };

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

        <S.Divider />

        {showLoading ? (
          <TitleSkeleton width="180px" />
        ) : (
          <>
            {topic?.title}
            <EditTopicButton
              topicId={topicId}
              currentTitle={topic?.title}
            />
          </>
        )}
      </S.LeftSection>
      <S.RightSection>
        <CreateIssueButton />
        <S.Divider />
        <S.Profile onClick={handleProfileClick}>
          {showSessionLoading ? (
            <>
              <TextSkeleton width="42px" />
              <CircleSkeleton size="38px" />
            </>
          ) : (
            <>
              {userName}
              {userImage && (
                <Image
                  src={userImage}
                  alt="프로필"
                  width={38}
                  height={38}
                  style={{ borderRadius: '50%' }}
                />
              )}
            </>
          )}
        </S.Profile>
      </S.RightSection>
    </S.HeaderContainer>
  );
}
