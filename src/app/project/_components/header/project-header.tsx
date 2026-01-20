'use client';

import { useParams } from 'next/navigation';
import * as S from './project-header.styles';

const ProjectHeader = () => {
  const params = useParams<{ id: string }>();
  const projectId = params?.id; 

  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <S.Title>내 프로젝트</S.Title>
      </S.LeftSection>
      <S.RightSection>
        <S.Name>이름</S.Name>
        <S.Avatar />
      </S.RightSection>
    </S.HeaderContainer>
  );
};

export default ProjectHeader;
