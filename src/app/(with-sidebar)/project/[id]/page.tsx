import Image from 'next/image';
import { redirect } from 'next/navigation';
import * as projectRepository from '@/lib/repositories/project.repository';
import Card from '../_components/card/card';
import ProjectEditButton from '../_components/project-edit-button/project-edit-button';
import CreateTopicButton from '../_components/create-topic-button/create-topic-button';
import * as S from './page.styles';
import { formatRelativeTime } from '@/lib/utils/time';

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

  return (
    <S.ProjectPageContainer>
      <S.ProjectTitleBox>
        {/* 프로젝트 헤더 */}
        <S.ProjectTitleHeader>
          <S.DateSection>{formatRelativeTime(created_at)}</S.DateSection>
          <ProjectEditButton currentTitle={title} currentDescription={description ?? undefined} />
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
          {topics.map((topic) => (
            <Card
              key={topic.id}
              id={topic.id}
              variant="item"
              leftIcon="/folder.svg"
              title={topic.title}
              subtitle={`이슈 ${topic.issueCount}개`}
              showArrow
            />
          ))}
        </S.TopicCardsContainer>
      </S.TopicSection>
    </S.ProjectPageContainer>
  );
}
