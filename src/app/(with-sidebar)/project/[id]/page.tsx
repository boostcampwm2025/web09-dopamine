import Image from 'next/image';
import HeaderButton from '../../issue/_components/header/header-button';
import Card from '../_components/card/card';
import * as S from './page.styles';

const ProjectPage = () => {
  const title = '머피 서비스 런칭';
  const desc = '2025 네이버 부스트캠프 멤버십 팀 프로젝트'

  // TODO: 실제 데이터로 교체 필요
  const topics = [
    {
      id: 1,
      title: '서비스 홍보 방안',
      issueCount: 8,
      status: '진행 중',
    },
    {
      id: 2,
      title: 'UI/UX 개선',
      issueCount: 5,
      status: '진행 중',
    },
    {
      id: 3,
      title: '성능 최적화',
      issueCount: 3,
      status: '완료',
    },
  ];

  // TODO: 실제 데이터로 교체 필요
  const members = [
    { id: 1, name: '김철수', profileImage: '/profile.svg', isOwner: true },
    { id: 2, name: '이영희', profileImage: '/profile.svg' },
    { id: 3, name: '박지민', profileImage: '/profile.svg' },
    { id: 4, name: '정다현', profileImage: '/profile.svg' },
  ];

  return (
    <S.ProjectPageContainer>
      {/* 프로젝트 제목 */}
      <S.ProjectTitleBox>
        <S.ProjectTitleWrapper>
          <Image
            src="/check-circle.svg"
            alt="체크 아이콘"
            width={32}
            height={32}
          />
          <S.ProjectTitleInfo>
            <S.ProjectTitle>{title}</S.ProjectTitle>
            <S.ProjectCreatedDate>{desc}</S.ProjectCreatedDate>
          </S.ProjectTitleInfo>
        </S.ProjectTitleWrapper>
        <S.EditIconWrapper>
          <Image
            src="/edit.svg"
            alt="편집"
            width={16}
            height={16}
          />
        </S.EditIconWrapper>
      </S.ProjectTitleBox>
      {/* 토픽 리스트 */}
      <S.TopicSection>
        <S.TopicListContainer>
          <S.TopicListHeader>
            <S.TopicListTitle>토픽 목록</S.TopicListTitle>
            <S.TopicListDescription>팀이 논의해야 할 큰 주제들입니다.</S.TopicListDescription>
          </S.TopicListHeader>
          <HeaderButton
            imageSrc="/white-add.svg"
            alt="새 토픽"
            text="새 토픽"
            variant="solid"
            color="green"
          />
        </S.TopicListContainer>
        <S.TopicCardsContainer>
          {topics.map((topic) => (
            <Card
              key={topic.id}
              variant="item"
              leftIcon="/folder.svg"
              title={topic.title}
              subtitle={`이슈 ${topic.issueCount}개 • ${topic.status}`}
              showArrow
            />
          ))}
        </S.TopicCardsContainer>
      </S.TopicSection>
    </S.ProjectPageContainer>
  );
};

export default ProjectPage;
