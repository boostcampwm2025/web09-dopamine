'use client';

import * as S from './project-card.styles';

interface ProjectCardProps {
  id?: number;
  title?: string;
  icon?: string;
  memberCount?: number;
  isCreateCard?: boolean;
}

export function ProjectCard({
  title,
  icon,
  memberCount,
  isCreateCard = false,
}: ProjectCardProps) {
  if (isCreateCard) {
    return (
      <S.CreateCard>
        <S.CreateIcon>+</S.CreateIcon>
        <S.CreateText>새 프로젝트 만들기</S.CreateText>
      </S.CreateCard>
    );
  }

  return (
    <S.Card>
      <S.CardHeader hasIcon={!!icon}>
        {icon && <S.Icon>{icon}</S.Icon>}
        <S.Title>{title}</S.Title>
        <S.Info>멤버 {memberCount}명</S.Info>
      </S.CardHeader>
      <S.CardFooter>
        <S.Divider />
        <S.CardBody>
          <S.MemberAvatars>
            <S.MemberAvatar />
            <S.MemberAvatar />
            <S.MemberAvatar />
          </S.MemberAvatars>
          <S.AddMember>+ 초대하기</S.AddMember>
        </S.CardBody>
      </S.CardFooter>
    </S.Card>
  );
}