'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as MS from '@/app/(with-sidebar)/issue/_components/edit-issue-modal/edit-issue-modal.styles';
import * as S from '@/app/(with-sidebar)/issue/_components/issue-join-modal/issue-join-modal.styles';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { useModalStore } from '@/components/modal/use-modal-store';
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
  const connectionId = useSseConnectionStore((state) => state.connectionIds[topicId]);

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
    deleteTopic(connectionId, {
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
    setTitle(e.target.value);
  };

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>토픽 제목</S.InputTitle>
          <S.Input
            value={title}
            onChange={onChangeTitle}
            placeholder="제목을 입력하세요"
            autoFocus
            disabled={isPending}
          />
        </S.InputWrapper>
        <MS.DeleteButton onClick={handleDelete}>삭제하기</MS.DeleteButton>
      </S.InfoContainer>
    </S.Container>
  );
}
