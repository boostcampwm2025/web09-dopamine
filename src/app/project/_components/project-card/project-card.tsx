'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  useDeleteProjectMutation,
  useLeaveProjectMutation,
} from '@/hooks/project';
import { useInviteProjectModal } from '@/components/modal/invite-project-modal/use-invite-project-modal';
import { useModalStore } from '@/components/modal/use-modal-store';
import ProjectCreateModal from '../project-create-modal/project-create-modal';
import * as S from './project-card.styles';

interface ProjectCardProps {
  id?: string;
  title?: string;
  icon?: string;
  memberCount?: number;
  isCreateCard?: boolean;
  ownerId?: string;
}

export function ProjectCard({
  id,
  title,
  icon,
  memberCount,
  isCreateCard = false,
  ownerId,
}: ProjectCardProps) {
  const { data: session } = useSession();
  const { openModal } = useModalStore();
  const router = useRouter();
  const { mutate: deleteProject } = useDeleteProjectMutation();
  const { mutate: leaveProject } = useLeaveProjectMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const suppressNextClickRef = useRef(false);

  const isOwner = session?.user?.id === ownerId;
  const { openInviteProjectModal } = useInviteProjectModal();

  const handleCreateClick = () => {
    openModal({
      title: '새 프로젝트 만들기',
      content: <ProjectCreateModal />,
      hasCloseButton: true,
    });
  };

  const handleGoProject = () => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }
    router.push(`/project/${id}`);
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        suppressNextClickRef.current = true;
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  if (isCreateCard) {
    return (
      <S.CreateCard onClick={handleCreateClick}>
        <S.CreateIcon>+</S.CreateIcon>
        <S.CreateText>새 프로젝트 만들기</S.CreateText>
      </S.CreateCard>
    );
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (
      confirm(
        '프로젝트를 삭제하면 모든 토픽, 이슈, 멤버 정보도 같이 삭제됩니다.\n정말 삭제하시겠습니까?',
      )
    ) {
      if (id) {
        deleteProject(
          { id },
          {
            onSuccess: () => {
              toast.success('프로젝트가 삭제되었습니다.');
            },
            onError: () => {
              toast.error('프로젝트 삭제에 실패했습니다.');
            },
          },
        );
      }
    }
  };

  const handleLeaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    const memberId = session?.user?.id;
    if (!memberId) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    if (confirm('프로젝트에서 나가시겠습니까?')) {
      if (id) {
        leaveProject(
          { projectId: id, memberId },
          {
            onSuccess: () => {
              toast.success('프로젝트에서 나갔습니다.');
            },
            onError: () => {
              toast.error('프로젝트 나가기 실패했습니다.');
            },
          },
        );
      }
    }
  };

  return (
    <S.Card onClick={handleGoProject}>
      <S.MenuWrapper ref={menuRef}>
        <S.Button
          onClick={handleMenuToggle}
          type="button"
        >
          <Image
            src="/hamburger.svg"
            alt="메뉴 열기"
            width={20}
            height={20}
          />
        </S.Button>
        {isMenuOpen && (
          <S.MenuModal onClick={(e) => e.stopPropagation()}>
            {isOwner ? (
              <S.MenuItem
                onClick={handleDeleteClick}
                type="button"
              >
                삭제
                <S.Tooltip role="tooltip">삭제하면 복구할 수 없습니다</S.Tooltip>
              </S.MenuItem>
            ) : (
              <S.MenuItem
                onClick={handleLeaveClick}
                type="button"
              >
                나가기
              </S.MenuItem>
            )}
          </S.MenuModal>
        )}
      </S.MenuWrapper>
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
          <S.AddMember onClick={(e) => openInviteProjectModal(id!, title!, e)}>
            + 초대하기
          </S.AddMember>
        </S.CardBody>
      </S.CardFooter>
    </S.Card>
  );
}
