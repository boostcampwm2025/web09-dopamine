'use client';

import Image from 'next/image';
import { useModalStore } from '@/components/modal/use-modal-store';
import CreateIssueModal from '@/app/(with-sidebar)/topic/_components/create-issue-modal/create-issue-modal';
import * as S from './new-issue-button.styles';

export default function NewIssueButton() {
  const { openModal } = useModalStore();

  const handleClick = () => {
    // 토픽 페이지와 이슈 페이지 모두 CreateIssueModal 열기
    openModal({
      title: '새 이슈 만들기',
      content: <CreateIssueModal />,
      hasCloseButton: true,
    });
  };

  return (
    <S.StyledNewIssueButton onClick={handleClick}>
      <Image
        src="/white-add.svg"
        alt="플러스 아이콘"
        width={18}
        height={18}
      />
    </S.StyledNewIssueButton>
  );
}
