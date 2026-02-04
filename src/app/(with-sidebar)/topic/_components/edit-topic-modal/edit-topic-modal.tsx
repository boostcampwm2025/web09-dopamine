'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as S from '@/app/(with-sidebar)/issue/_components/issue-join-modal/issue-join-modal.styles';
import { useModalStore } from '@/components/modal/use-modal-store';
import { MAX_TOPIC_TITLE_LENGTH } from '@/constants/topic';
import { useUpdateTopicTitleMutation } from '@/hooks';

export interface EditTopicProps {
  topicId: string;
  currentTitle?: string;
  userId: string;
}

export default function EditTopicModal({ topicId, currentTitle, userId }: EditTopicProps) {
  const [title, setTitle] = useState(currentTitle || '');
  const { setIsPending, isOpen, closeModal } = useModalStore();
  const { mutate, isPending } = useUpdateTopicTitleMutation(topicId);

  useEffect(() => {
    setIsPending(isPending);
  }, [isPending, setIsPending]);

  const handleUpdate = useCallback(async () => {
    if (!title.trim()) {
      toast.error('토픽 제목을 입력해주세요.');
      return;
    }

    if (title.length > MAX_TOPIC_TITLE_LENGTH) {
      toast.error(`토픽 제목은 ${MAX_TOPIC_TITLE_LENGTH}자 이내로 입력해주세요.`);
      return;
    }

    mutate(
      { title, userId },
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
    const value = e.target.value.slice(0, MAX_TOPIC_TITLE_LENGTH);
    setTitle(value);
  };

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>토픽 제목</S.InputTitle>
          <S.Input>
            <S.InputField
              value={title}
              onChange={onChangeTitle}
              placeholder={`제목을 입력하세요. (${MAX_TOPIC_TITLE_LENGTH}자 이내)`}
              maxLength={MAX_TOPIC_TITLE_LENGTH}
              autoFocus
              disabled={isPending}
            />
            <S.CharCount $isOverLimit={title.length > MAX_TOPIC_TITLE_LENGTH}>
              {title.length}/{MAX_TOPIC_TITLE_LENGTH}
            </S.CharCount>
          </S.Input>
        </S.InputWrapper>
      </S.InfoContainer>
    </S.Container>
  );
}
