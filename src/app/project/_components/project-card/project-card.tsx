'use client';

import { useRouter } from 'next/navigation';
import { useModalStore } from '@/components/modal/use-modal-store';
import ProjectCreateModal from '../project-create-modal/project-create-modal';
import * as S from './project-card.styles';

interface ProjectCardProps {
  id?: string;
  title?: string;
  icon?: string;
  memberCount?: number;
  isCreateCard?: boolean;
}

export function ProjectCard({
  id,
  title,
  icon,
  memberCount,
  isCreateCard = false,
}: ProjectCardProps) {
  const { openModal } = useModalStore();
  const router = useRouter();

  const handleCreateClick = () => {
    openModal({
      title: '새 프로젝트 만들기',
      content: <ProjectCreateModal />,
      hasCloseButton: true,
    });
  };

  const handleGoProject = () => {
    router.push(`/project/${id}`);
  };

  if (isCreateCard) {
    return (
      <S.CreateCard onClick={handleCreateClick}>
        <S.CreateIcon>+</S.CreateIcon>
        <S.CreateText>새 프로젝트 만들기</S.CreateText>
      </S.CreateCard>
    );
  }

  return (
    <S.Card onClick={handleGoProject}>
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
