'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import * as S from '@/app/(with-sidebar)/issue/_components/issue-join-modal/issue-join-modal.styles';
import { useModalStore } from '@/components/modal/use-modal-store';
import { useCreateIssueInTopicMutation, useTopicId } from '@/hooks';

export default function CreateIssueModal() {
  const router = useRouter();
  const [issueTitle, setIssueTitle] = useState('');
  const { setIsPending, isOpen, closeModal } = useModalStore();
  const { mutate, isPending } = useCreateIssueInTopicMutation();

  useEffect(() => {
    setIsPending(isPending);
  }, [isPending, setIsPending]);

  // 토픽 ID 가져오기 (토픽 페이지면 URL에서, 이슈 페이지면 이슈 데이터에서)
  const { topicId } = useTopicId();

  const handleCreate = useCallback(async () => {
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
        onSuccess: () => {
          closeModal();
          router.refresh();
        },
      },
    );
  }, [issueTitle, topicId, mutate]);

  useEffect(() => {
    if (isOpen) {
      useModalStore.setState({
        onSubmit: handleCreate,
      });
    }
  }, [isOpen, handleCreate]);

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIssueTitle(e.target.value);
  };

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>이슈 제목</S.InputTitle>
          <S.Input>
            <S.InputField
              value={issueTitle}
              onChange={onChangeTitle}
              placeholder="제목을 입력하세요"
              autoFocus
              disabled={isPending}
              maxLength={15}
            />
            <S.CharCount $isOverLimit={issueTitle.length > 15}>{issueTitle.length}/15</S.CharCount>
          </S.Input>
        </S.InputWrapper>
      </S.InfoContainer>
    </S.Container>
  );
}
