'use client';

import Image from 'next/image';
import * as S from '@/app/(with-sidebar)/project/[id]/page.styles';
import ProjectModal from '@/app/(with-sidebar)/project/_components/project-modal/project-modal';
import { useModalStore } from '@/components/modal/use-modal-store';

interface EditProjectProps {
  projectId: string;
  currentTitle: string;
  currentDescription?: string;
}

export default function EditProject({
  projectId,
  currentTitle,
  currentDescription,
}: EditProjectProps) {
  const { openModal } = useModalStore();

  const handleEditClick = () => {
    openModal({
      title: '프로젝트 설정',
      content: (
        <ProjectModal
          variant="project"
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
    <S.SettingIconWrapper
      onClick={handleEditClick}
      aria-label="Setting"
      role="button"
      tabIndex={0}
    >
      <Image
        src="/settings.svg"
        alt="Edit"
        width={16}
        height={16}
      />
    </S.SettingIconWrapper>
  );
}
