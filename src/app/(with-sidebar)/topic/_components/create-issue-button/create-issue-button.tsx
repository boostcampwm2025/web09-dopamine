'use client';

import { useModalStore } from '@/components/modal/use-modal-store';
import HeaderButton from '../../../issue/_components/header/header-button';
import CreateIssueModal from '../create-issue-modal/create-issue-modal';

export default function CreateIssueButton() {
  const { openModal } = useModalStore();

  const handleClick = () => {
    openModal({
      title: '새 이슈 만들기',
      content: <CreateIssueModal />,
      hasCloseButton: true,
    });
  };

  return (
    <HeaderButton
      imageSrc="/white-add.svg"
      alt="새 이슈"
      text="새 이슈"
      variant="solid"
      color="green"
      onClick={handleClick}
    />
  );
}
