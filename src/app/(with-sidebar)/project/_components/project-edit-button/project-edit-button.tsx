'use client';

import Image from 'next/image';
import ProjectEditModal from '@/components/modal/project-edit-modal/project-edit-modal';
import { useModalStore } from '@/components/modal/use-modal-store';
import * as S from '@/app/(with-sidebar)/project/[id]/page.styles';

interface ProjectEditButtonProps {
  projectId: string;
  currentTitle: string;
  currentDescription?: string;
}

export default function ProjectEditButton({ projectId, currentTitle, currentDescription }: ProjectEditButtonProps) {
  const { openModal } = useModalStore();

  const handleEditClick = () => {
    openModal({
      title: '프로젝트 이름 수정',
      content: (
        <ProjectEditModal
          projectId={projectId}
          currentTitle={currentTitle}
          currentDescription={currentDescription}
        />
      ),
      closeOnOverlayClick: true,
      hasCloseButton: true,
    });
  };

  return (
    <S.EditIconWrapper
      onClick={handleEditClick}
      aria-label="Edit"
      role="button"
      tabIndex={0}
    >
      <Image
        src="/edit.svg"
        alt="Edit"
        width={16}
        height={16}
      />
    </S.EditIconWrapper>
  );
}
