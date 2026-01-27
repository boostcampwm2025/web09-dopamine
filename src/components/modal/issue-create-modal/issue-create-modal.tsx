'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuickStartMutation } from '@/hooks/issue';
import { generateRandomNickname } from '@/lib/utils/nickname';
import { useModalStore } from '../use-modal-store';
import * as S from './issue-create-modal.styles';

export default function CreateIssueModal() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [ownerNickname, setOwnerNickname] = useState(generateRandomNickname());
  const { setIsPending, isOpen, closeModal } = useModalStore();

  const { mutate, isPending } = useQuickStartMutation();

  useEffect(() => {
    setIsPending(isPending);
  }, [isPending, setIsPending]);

  const handleQuickStart = useCallback(async () => {
    if (!title.trim() || !ownerNickname.trim()) {
      toast.error('이슈 제목과 닉네임을 입력해주세요.');
      return;
    }

    mutate(
      { title, nickname: ownerNickname },
      {
        onSuccess: (newIssue) => {
          closeModal();
          router.push(`/issue/${newIssue.issueId}`);
        },
      },
    );
  }, [title, ownerNickname, mutate, closeModal, router]);

  useEffect(() => {
    if (isOpen) {
      useModalStore.setState({
        onSubmit: handleQuickStart,
      });
    }
  }, [isOpen, handleQuickStart]);

  return (
    <>
      <S.Container>
        <S.InfoContainer>
          <S.InputWrapper>
            <S.InputTitle>이슈 제목</S.InputTitle>
            <S.Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예시) 서비스 홍보 방안"
            />
          </S.InputWrapper>
          <S.InputWrapper>
            <S.InputTitle>표시될 닉네임</S.InputTitle>
            <S.Input
              value={ownerNickname}
              onChange={(e) => setOwnerNickname(e.target.value)}
              placeholder="예시) 생각하는 단무지"
            />
          </S.InputWrapper>
        </S.InfoContainer>
      </S.Container>
    </>
  );
}
