import Image from 'next/image';
import { redirect } from 'next/navigation';
import * as projectRepository from '@/lib/repositories/project.repository';
import Card, { CardSkeleton } from '../_components/card/card';
import CreateTopicButton from '../_components/create-topic-button/create-topic-button';
import EditProjectButton from '../_components/edit-project-button/edit-project-button';
import EmptyTopicState from '../_components/empty-topic-state/empty-topic-state';
import * as S from './page.styles';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const projectData = await projectRepository.getProjectWithTopics(id);

  if (!projectData) {
    redirect('/project');
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
          <S.TopicCardsContainer>
            {topics.length === 0 ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <S.EmptyTopicOverlay>
                  <EmptyTopicState />
                </S.EmptyTopicOverlay>
              </>
            ) : (
              topics.map((topic) => (
                <Card
                  key={topic.id}
                  id={topic.id}
                  variant="item"
                  leftIcon="/folder.svg"
                  title={topic.title}
                  subtitle={`이슈 ${topic.issueCount}개`}
                  showArrow
                />
              ))
            )}
          </S.TopicCardsContainer>
        </S.TopicSection>
      </S.Container>
    </S.Background>
  );
}
