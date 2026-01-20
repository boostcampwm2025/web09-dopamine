'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import * as S from '@/app/(with-sidebar)/issue/_components/issue-join-modal/issue-join-modal.styles';
import { useCreateProjectMutation } from '@/app/project/hooks/use-project-mutation';
import { useModalStore } from '@/components/modal/use-modal-store';

export default function CreateTopicModal() {
  const router = useRouter();
  const [topicName, setTopicName] = useState('');
  const { closeModal } = useModalStore();
  const { mutate, isPending } = useCreateProjectMutation();

  const handleCreate = async () => {
    if (!topicName.trim()) {
      toast.error('토픽 이름을 입력해주세요.');
      return;
    }

    mutate(
      { title: topicName },
      {
        onSuccess: (newTopic) => {
          toast.success('토픽이 생성되었습니다!');
          closeModal();
          router.push(`/topic/${newTopic.id}`);
        },
      },
    );
  };

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>토픽 이름</S.InputTitle>
          <S.Input
            value={topicName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopicName(e.target.value)}
            placeholder="이름을 입력하세요"
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
