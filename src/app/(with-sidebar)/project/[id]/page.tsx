import Image from 'next/image';
import InfoCard from '../_components/info-card/info-card';
import * as S from './page.styles';

const ProjectPage = () => {
  const title = '머피 서비스 런칭';
  const desc =
    '머피 서비스 런칭은 팀이 아이디어를 자유롭게 제안하고, 토론을 통해 정리한 뒤 의사결정까지 자연스럽게 이어갈 수 있도록 돕는 협업 서비스입니다. 프로젝트 초기의 혼란을 줄이고, 논의 과정을 한눈에 공유할 수 있는 환경을 만드는 것을 목표로 합니다.';

  return (
    <S.ProjectPageContainer>
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
    </S.ProjectPageContainer>
  );
};

export default ProjectPage;
