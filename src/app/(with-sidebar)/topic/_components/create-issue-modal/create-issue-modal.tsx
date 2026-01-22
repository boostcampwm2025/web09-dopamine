'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import * as S from '@/app/(with-sidebar)/issue/_components/issue-join-modal/issue-join-modal.styles';
import { useModalStore } from '@/components/modal/use-modal-store';
import { useMutation } from '@tanstack/react-query';
import { createIssueInTopic } from '@/lib/api/issue';

export default function CreateIssueModal() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.id as string;
  const [issueTitle, setIssueTitle] = useState('');
  const { closeModal } = useModalStore();

  const { mutate, isPending } = useMutation({
    mutationFn: (title: string) => createIssueInTopic(topicId, title),
    onSuccess: (data) => {
      toast.success('이슈가 생성되었습니다!');
      closeModal();
      router.push(`/issue/${data.issueId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || '이슈 생성에 실패했습니다.');
    },
  });

  const handleCreate = async () => {
    if (!issueTitle.trim()) {
      toast.error('이슈 제목을 입력해주세요.');
      return;
    }

    if (!topicId) {
      toast.error('토픽 ID를 찾을 수 없습니다.');
      return;
    }

    mutate(issueTitle);
  };

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>이슈 제목</S.InputTitle>
          <S.Input
            value={issueTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIssueTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && !isPending) {
                handleCreate();
              }
            }}
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
