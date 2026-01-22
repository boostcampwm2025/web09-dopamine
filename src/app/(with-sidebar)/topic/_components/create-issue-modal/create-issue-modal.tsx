'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import * as S from '@/app/(with-sidebar)/issue/_components/issue-join-modal/issue-join-modal.styles';
import { useCreateIssueInTopicMutation } from '@/app/(with-sidebar)/issue/hooks';
import { useModalStore } from '@/components/modal/use-modal-store';
import { useTopicId } from '@/hooks/use-topic-id';

export default function CreateIssueModal() {
  const router = useRouter();
  const [issueTitle, setIssueTitle] = useState('');
  const { closeModal } = useModalStore();
  const { mutate, isPending } = useCreateIssueInTopicMutation();

  // 토픽 ID 가져오기 (토픽 페이지면 URL에서, 이슈 페이지면 이슈 데이터에서)
  const { topicId } = useTopicId();

  const handleCreate = () => {
    if (!topicId) {
      toast.error('토픽 정보를 찾을 수 없습니다.');
      return;
    }

    if (!issueTitle.trim()) {
      toast.error('이슈 제목을 입력해주세요.');
      return;
    }

    mutate(
      { topicId, title: issueTitle },
      {
        onSuccess: (data) => {
          closeModal();
          router.push(`/issue/${data.issueId}`);
        },
      },
    );
  };

  const onKeyDownEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isPending) {
      handleCreate();
    }
  };

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIssueTitle(e.target.value);
  };

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>이슈 제목</S.InputTitle>
          <S.Input
            value={issueTitle}
            onChange={onChangeTitle}
            placeholder="제목을 입력하세요"
            onKeyDown={onKeyDownEnter}
            autoFocus
            disabled={isPending}
          />
        </S.InputWrapper>
      </S.InfoContainer>

      <S.Footer>
        <S.SubmitButton
          type="button"
          onClick={handleCreate}
          disabled={isPending}
        >
          {isPending ? '생성 중...' : '만들기'}
        </S.SubmitButton>
      </S.Footer>
    </S.Container>
  );
}
