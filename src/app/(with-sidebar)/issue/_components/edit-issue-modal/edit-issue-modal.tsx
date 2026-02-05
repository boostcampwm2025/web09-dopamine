'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as S from '@/app/(with-sidebar)/issue/_components/issue-join-modal/issue-join-modal.styles';
import { useModalStore } from '@/components/modal/use-modal-store';
import { MAX_ISSUE_TITLE_LENGTH } from '@/constants/issue';
import { useDeleteIssueMutation, useUpdateIssueTitleMutation } from '@/hooks';
import { useSseConnectionStore } from '../../store/use-sse-connection-store';
import * as MS from './edit-issue-modal.styles';

export interface EditIssueProps {
  issueId: string;
  currentTitle?: string;
}

export default function EditIssueModal({ issueId, currentTitle }: EditIssueProps) {
  const [title, setTitle] = useState(currentTitle || '');
  const { setIsPending, isOpen, closeModal } = useModalStore();
  const { mutate: updateIssue, isPending: isUpdatePending } = useUpdateIssueTitleMutation(issueId);
  const { mutate: deleteIssue, isPending: isDeletePending } = useDeleteIssueMutation(issueId);
  const connectionId = useSseConnectionStore((state) => state.connectionIds[issueId]);

  const isPending = isUpdatePending || isDeletePending;

  useEffect(() => {
    setIsPending(isPending);

    return () => {
      setIsPending(false);
    };
  }, [isPending, setIsPending]);

  const handleUpdate = useCallback(async () => {
    if (!title.trim()) {
      toast.error('이슈 제목을 입력해주세요.');
      return;
    }
    if (title.length > MAX_ISSUE_TITLE_LENGTH) {
      toast.error(`이슈 제목은 ${MAX_ISSUE_TITLE_LENGTH}자 이내로 입력해주세요.`);
      return;
    }

    updateIssue(
      { title, connectionId },
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
        '이슈를 삭제하시겠습니까? 이슈를 삭제하면 이슈에 속한 모든 카테고리, 아이디어, 멤버의 데이터가 삭제됩니다.',
      )
    ) {
      return;
    }
    deleteIssue(
      { connectionId },
      {
        onSuccess: () => {
          closeModal();
        },
      },
    );
  }, [deleteIssue]);

  useEffect(() => {
    if (isOpen) {
      useModalStore.setState({
        onSubmit: handleUpdate,
      });
    }
  }, [isOpen, handleUpdate]);

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, MAX_ISSUE_TITLE_LENGTH);
    setTitle(value);
  };

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>이슈 제목</S.InputTitle>
          <S.Input>
            <S.InputField
              value={title}
              onChange={onChangeTitle}
              placeholder={`제목을 입력하세요 (${MAX_ISSUE_TITLE_LENGTH}자 이내)`}
              maxLength={MAX_ISSUE_TITLE_LENGTH}
              autoFocus
              disabled={isPending}
            />
            <S.CharCount $isOverLimit={title.length > MAX_ISSUE_TITLE_LENGTH}>
              {title.length}/{MAX_ISSUE_TITLE_LENGTH}
            </S.CharCount>
          </S.Input>
        </S.InputWrapper>
        <MS.DeleteButton onClick={handleDelete}>삭제하기</MS.DeleteButton>
      </S.InfoContainer>
    </S.Container>
  );
}
