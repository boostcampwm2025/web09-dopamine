'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as MS from '@/app/(with-sidebar)/issue/_components/edit-issue-modal/edit-issue-modal.styles';
import * as S from '@/app/(with-sidebar)/issue/_components/issue-join-modal/issue-join-modal.styles';
import { useModalStore } from '@/components/modal/use-modal-store';
import { MAX_TOPIC_TITLE_LENGTH } from '@/constants/topic';
import { useDeleteTopicMutation, useUpdateTopicTitleMutation } from '@/hooks';

export interface EditTopicProps {
  topicId: string;
  currentTitle?: string;
  userId: string;
}

export default function EditTopicModal({ topicId, currentTitle, userId }: EditTopicProps) {
  const [title, setTitle] = useState(currentTitle || '');
  const { setIsPending, isOpen, closeModal } = useModalStore();
  const { mutate: updateIssue, isPending: isUpdatePending } = useUpdateTopicTitleMutation(topicId);
  const { mutate: deleteTopic, isPending: isDeletePending } = useDeleteTopicMutation(topicId);

  const isPending = isUpdatePending || isDeletePending;

  useEffect(() => {
    setIsPending(isPending);

    return () => {
      setIsPending(false);
    };
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

    updateIssue(
      { title, userId },
      {
        onSuccess: () => {
          closeModal();
        },
      },
    );
  }, [title, updateIssue]);

  const handleDelete = useCallback(async () => {
    if (
      !confirm(
        '토픽을 삭제하시겠습니까? 토픽을 삭제하면 토픽에 속한 모든 이슈, 카테고리, 아이디어, 멤버의 데이터가 삭제됩니다.',
      )
    ) {
      return;
    }
    deleteTopic(undefined, {
      onSuccess: () => {
        closeModal();
      },
    });
  }, [deleteTopic]);

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
        <MS.DeleteButton onClick={handleDelete}>삭제하기</MS.DeleteButton>
      </S.InfoContainer>
    </S.Container>
  );
}
