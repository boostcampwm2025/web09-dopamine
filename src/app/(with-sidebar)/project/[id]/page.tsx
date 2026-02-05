import { getServerSession } from 'next-auth';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getProjectWithTopicsForUser } from '@/lib/services/project.service';
import CreateTopicButton from '../_components/create-topic-button/create-topic-button';
import EditProjectButton from '../_components/edit-project-button/edit-project-button';
import TopicList from '../_components/topic-list/topic-list';
import * as S from './page.styles';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  // 세션 확인
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/');
  }

  // 프로젝트 데이터 조회 (권한 확인 포함)
  let projectData;
  try {
    projectData = await getProjectWithTopicsForUser(id, session.user.id);
  } catch (error) {
    redirect('/');
  }

  if (!projectData) {
    notFound();
  }

  const { title, description, topics, created_at } = projectData;

  const createdAt = created_at.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <S.Background>
      <S.Container>
        <S.ProjectTitleBox>
          {/* 프로젝트 헤더 */}
          <S.ProjectTitleHeader>
            <S.DateSection>{createdAt}</S.DateSection>
            <EditProjectButton
              projectId={id}
              currentTitle={title}
              currentDescription={description ?? undefined}
            />
          </S.ProjectTitleHeader>
          {/* 프로젝트 제목 */}
          <S.ProjectTitleWrapper>
            <Image
              src="/check-circle.svg"
              alt="체크 아이콘"
              width={32}
              height={32}
            />
            <S.ProjectTitleInfo>
              <S.ProjectTitle>{title}</S.ProjectTitle>
              <S.ProjectCreatedDate>{description}</S.ProjectCreatedDate>
            </S.ProjectTitleInfo>
          </S.ProjectTitleWrapper>
        </S.ProjectTitleBox>
        {/* 토픽 리스트 */}
        <S.TopicSection>
          <S.TopicListContainer>
            <S.TopicListHeader>
              <S.TopicListTitle>토픽 목록</S.TopicListTitle>
              <S.TopicListDescription>팀이 논의해야 할 큰 주제들입니다.</S.TopicListDescription>
            </S.TopicListHeader>
            <CreateTopicButton />
          </S.TopicListContainer>
          <TopicList
            projectId={id}
            initialTopics={topics}
          />
        </S.TopicSection>
      </S.Container>
    </S.Background>
  );
}
