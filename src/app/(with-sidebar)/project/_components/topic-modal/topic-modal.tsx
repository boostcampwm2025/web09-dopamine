'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useModalStore } from '@/components/modal/use-modal-store';
import { useCreateTopicMutation } from '@/hooks/topic';
import * as S from './topic-modal.styles';

interface TopicModalProps {
  projectId?: string;
}

export default function TopicModal({ projectId }: TopicModalProps) {
  const router = useRouter();
  const params = useParams();
  const { setIsPending, isOpen, closeModal } = useModalStore();
  const [topicName, setTopicName] = useState('');
  const { mutate, isPending } = useCreateTopicMutation();

  const resolvedProjectId = projectId ?? (params.id as string | undefined);

  useEffect(() => {
    setIsPending(isPending);
  }, [isPending, setIsPending]);

  const handleSubmit = useCallback(async () => {
    if (!topicName.trim()) {
      toast.error('토픽 이름을 입력해주세요.');
      return;
    }

    if (!resolvedProjectId) {
      toast.error('프로젝트 ID를 찾을 수 없습니다.');
      return;
    }

    mutate(
      { title: topicName, projectId: resolvedProjectId },
      {
        onSuccess: () => {
          toast.success('토픽이 생성되었습니다!');
          closeModal();
          router.refresh();
        },
      },
    );
  }, [topicName, resolvedProjectId, mutate, closeModal, router]);

  useEffect(() => {
    if (isOpen) {
      useModalStore.setState({
        onSubmit: handleSubmit,
      });
    }
  }, [isOpen, handleSubmit]);

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>토픽 이름</S.InputTitle>
          <S.Input
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            placeholder="이름을 입력하세요"
            autoFocus
            disabled={isPending}
          />
        </S.InputWrapper>
      </S.InfoContainer>
    </S.Container>
  );
}
