'use client';

import Image from 'next/image';
import * as S from '@/app/(with-sidebar)/issue/_components/edit-issue-button/edit-issue-button.style';
import { useModalStore } from '@/components/modal/use-modal-store';
import EditTopicModal, { EditTopicProps } from '../edit-topic-modal/edit-topic-modal';

export default function EditTopicButton({ topicId, currentTitle, userId }: EditTopicProps) {
  const { openModal } = useModalStore();

  const handleEditClick = () => {
    openModal({
      title: '이슈 수정',
      content: (
        <EditTopicModal
          topicId={topicId}
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
