'use client';

import Image from 'next/image';
import { useModalStore } from '@/components/modal/use-modal-store';
import TopicModal from '../topic-modal/topic-modal';
import * as S from './empty-topic-state.styles';

export default function EmptyTopicState() {
  const { openModal } = useModalStore();

  const handleClick = () => {
    openModal({
      title: '새 토픽 만들기',
      content: <TopicModal />,
      hasCloseButton: true,
    });
  };

  return (
    <S.EmptyStateContainer>
      <S.AddButton type="button" onClick={handleClick} aria-label="첫 토픽 만들기">
        <Image src="/add.svg" alt="" width={28} height={28} />
      </S.AddButton>
      <S.Title>첫 번째 토픽을 추가해보세요</S.Title>
      <S.Description>
        프로젝트의 핵심 주제를 만들어 팀원들과 논의를 시작하세요.
      </S.Description>
    </S.EmptyStateContainer>
  );
}
