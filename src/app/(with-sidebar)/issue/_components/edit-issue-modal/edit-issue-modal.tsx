'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import * as S from '@/app/(with-sidebar)/issue/_components/issue-join-modal/issue-join-modal.styles';
import { useModalStore } from '@/components/modal/use-modal-store';
import { useUpdateIssueMutation } from '@/hooks';

export interface EditIssueProps {
  issueId: string;
  currentTitle?: string;
}

export default function EditIssueModal({ issueId, currentTitle }: EditIssueProps) {
  const [title, setTitle] = useState(currentTitle || '');
  const { setIsPending, isOpen, closeModal } = useModalStore();
  const { mutate, isPending } = useUpdateIssueMutation(issueId);

  useEffect(() => {
    setIsPending(isPending);
  }, [isPending, setIsPending]);

  const handleUpdate = useCallback(async () => {
    if (!title.trim()) {
      toast.error('이슈 제목을 입력해주세요.');
      return;
    }

    mutate(
      { title },
      {
        onSuccess: () => {
          closeModal();
        },
      },
    );
  }, [title, mutate]);

  useEffect(() => {
    if (isOpen) {
      useModalStore.setState({
        onSubmit: handleUpdate,
      });
    }
  }, [isOpen, handleUpdate]);

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>이슈 제목</S.InputTitle>
          <S.Input
            value={title}
            onChange={onChangeTitle}
            placeholder="제목을 입력하세요"
            autoFocus
            disabled={isPending}
          />
        </S.InputWrapper>
      </S.InfoContainer>
    </S.Container>
  );
}
