'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import * as S from '@/components/modal/issue-create-modal/issue-create-modal.styles';
import { useModalStore } from '@/components/modal/use-modal-store';
import { MAX_TOPIC_TITLE_LENGTH } from '@/constants/topic';
import { useCreateTopicMutation } from '@/hooks/topic';

interface TopicModalProps {
  projectId?: string;
}

export default function TopicModal({ projectId }: TopicModalProps) {
  const params = useParams();
  const setIsPending = useModalStore((state) => state.setIsPending);
  const isOpen = useModalStore((state) => state.isOpen);
  const closeModal = useModalStore((state) => state.closeModal);
  const [topicName, setTopicName] = useState('');
  const topicNameRef = useRef(topicName);
  const { mutate, isPending } = useCreateTopicMutation();

  // topicName의 최신 값을 ref에 동기화
  useEffect(() => {
    topicNameRef.current = topicName;
  }, [topicName]);

  const resolvedProjectId = projectId ?? (params.id as string | undefined);

  useEffect(() => {
    setIsPending(isPending);
  }, [isPending, setIsPending]);

  const handleSubmit = useCallback(async () => {
    const currentTopicName = topicNameRef.current;

    if (!currentTopicName.trim()) {
      toast.error('토픽 제목을 입력해주세요.');
      return;
    }

    if (currentTopicName.length > MAX_TOPIC_TITLE_LENGTH) {
      toast.error(`토픽 제목은 ${MAX_TOPIC_TITLE_LENGTH}자 이내로 입력해주세요.`);
      return;
    }

    if (!resolvedProjectId) {
      toast.error('프로젝트 ID를 찾을 수 없습니다.');
      return;
    }

    mutate(
      { title: currentTopicName, projectId: resolvedProjectId },
      {
        onSuccess: () => {
          toast.success('토픽이 생성되었습니다!');
          closeModal();
        },
      },
    );
  }, [resolvedProjectId, mutate, closeModal]);

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, MAX_TOPIC_TITLE_LENGTH);
    setTopicName(value);
  };

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
          <S.InputTitle>토픽 제목</S.InputTitle>
          <S.Input>
            <S.InputField
              value={topicName}
              onChange={onChangeTitle}
              placeholder={`제목을 입력하세요. (${MAX_TOPIC_TITLE_LENGTH}자 이내)`}
              maxLength={MAX_TOPIC_TITLE_LENGTH}
              autoFocus
              disabled={isPending}
            />
            <S.CharCount $isOverLimit={topicName.length > MAX_TOPIC_TITLE_LENGTH}>
              {topicName.length}/{MAX_TOPIC_TITLE_LENGTH}
            </S.CharCount>
          </S.Input>
        </S.InputWrapper>
      </S.InfoContainer>
    </S.Container>
  );
}
