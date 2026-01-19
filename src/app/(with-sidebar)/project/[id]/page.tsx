import Image from 'next/image';
import HeaderButton from '../../issue/_components/header/header-button';
import InfoCard from '../_components/info-card/info-card';
import TopicCard from '../_components/topic-card/topic-card';
import * as S from './page.styles';

const ProjectPage = () => {
  const title = '머피 서비스 런칭';
  const desc =
    '머피 서비스 런칭은 팀이 아이디어를 자유롭게 제안하고, 토론을 통해 정리한 뒤 의사결정까지 자연스럽게 이어갈 수 있도록 돕는 협업 서비스입니다. 프로젝트 초기의 혼란을 줄이고, 논의 과정을 한눈에 공유할 수 있는 환경을 만드는 것을 목표로 합니다.';

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

  return (
    <S.ProjectPageContainer>
      {/* 프로젝트 제목 */}
      <S.ProjectTitleBox>
        {title}
        <S.EditIconWrapper>
          <Image
            src="/edit.svg"
            alt="편집"
            width={16}
            height={16}
          />
        </S.EditIconWrapper>
      </S.ProjectTitleBox>
      {/* 프로젝트 설명 및 참가자 */}
      <S.ProjectInfoContainer>
        <S.ProjectDescBox>
          <InfoCard
            title="프로젝트 설명"
            rightIcon="/edit.svg"
            leftIcon="/green-comment.svg"
          />
          <S.ProjectDescText>{desc}</S.ProjectDescText>
        </S.ProjectDescBox>
        <S.MemberBox>
          <InfoCard
            title="팀원"
            leftIcon="/green-people.svg"
          />
        </S.MemberBox>
      </S.ProjectInfoContainer>
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
            <TopicCard
              key={topic.id}
              id={topic.id}
              title={topic.title}
              issueCount={topic.issueCount}
              status={topic.status}
            />
          ))}
        </S.TopicCardsContainer>
      </S.TopicSection>
    </S.ProjectPageContainer>
  );
};

export default ProjectPage;
