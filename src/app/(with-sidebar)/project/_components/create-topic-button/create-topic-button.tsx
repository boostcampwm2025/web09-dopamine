'use client';

import { useModalStore } from '@/components/modal/use-modal-store';
import HeaderButton from '../../../issue/_components/header/header-button';
import CreateTopicModal from '../create-topic-modal/create-topic-modal';

export default function CreateTopicButton() {
  const { openModal } = useModalStore();

  const handleClick = () => {
    openModal({
      title: '새 토픽 만들기',
      content: <CreateTopicModal />,
      hasCloseButton: true,
    });
  };

  return (
    <HeaderButton
      imageSrc="/white-add.svg"
      alt="새 토픽"
      text="새 토픽"
      variant="solid"
      color="green"
      onClick={handleClick}
    />
  );
}
