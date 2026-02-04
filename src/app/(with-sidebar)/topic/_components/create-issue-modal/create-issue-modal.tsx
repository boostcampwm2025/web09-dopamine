'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import * as S from '@/app/(with-sidebar)/issue/_components/issue-join-modal/issue-join-modal.styles';
import { useModalStore } from '@/components/modal/use-modal-store';
import { MAX_ISSUE_TITLE_LENGTH } from '@/constants/issue';
import { useCreateIssueInTopicMutation, useTopicId } from '@/hooks';

export default function CreateIssueModal() {
  const router = useRouter();
  const [issueTitle, setIssueTitle] = useState('');
  const issueTitleRef = useRef(issueTitle);
  const setIsPending = useModalStore((state) => state.setIsPending);
  const isOpen = useModalStore((state) => state.isOpen);
  const closeModal = useModalStore((state) => state.closeModal);
  const { mutate, isPending } = useCreateIssueInTopicMutation();

  // issueTitle의 최신 값을 ref에 동기화
  useEffect(() => {
    issueTitleRef.current = issueTitle;
  }, [issueTitle]);

  useEffect(() => {
    setIsPending(isPending);
  }, [isPending, setIsPending]);

  // 토픽 ID 가져오기 (토픽 페이지면 URL에서, 이슈 페이지면 이슈 데이터에서)
  const { topicId } = useTopicId();

  const handleCreate = useCallback(async () => {
    const currentIssueTitle = issueTitleRef.current;

    if (!topicId) {
      toast.error('토픽 정보를 찾을 수 없습니다.');
      return;
    }

    if (!currentIssueTitle.trim()) {
      toast.error('이슈 제목을 입력해주세요.');
      return;
    }

    mutate(
      { topicId, title: currentIssueTitle },
      {
        onSuccess: () => {
          closeModal();
          router.refresh();
        },
      },
    );
  }, [topicId, mutate, closeModal, router]);

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
              maxLength={MAX_ISSUE_TITLE_LENGTH}
            />
            <S.CharCount $isOverLimit={issueTitle.length > MAX_ISSUE_TITLE_LENGTH}>
              {issueTitle.length}/{MAX_ISSUE_TITLE_LENGTH}
            </S.CharCount>
          </S.Input>
        </S.InputWrapper>
      </S.InfoContainer>
    </S.Container>
  );
}
