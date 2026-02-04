'use client';

import Image from 'next/image';
import { useModalStore } from '@/components/modal/use-modal-store';
import EditIssueModal, { EditIssueProps } from '../edit-issue-modal/edit-issue-modal';
import * as S from './edit-issue-button.styles';

export default function EditIssueButton({ issueId, currentTitle, userId }: EditIssueProps) {
  const { openModal } = useModalStore();

  const handleEditClick = () => {
    openModal({
      title: '이슈 수정',
      content: (
        <EditIssueModal
          issueId={issueId}
          currentTitle={currentTitle}
          userId={userId}
        />
      ),
      closeOnOverlayClick: true,
      hasCloseButton: true,
    });
  };

  return (
    <S.Button
      onClick={handleEditClick}
      aria-label="Edit"
      role="button"
      tabIndex={0}
    >
      <Image
        src="/edit.svg"
        alt="Edit"
        width={14}
        height={14}
      />
    </S.Button>
  );
}
