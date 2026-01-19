'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuickStartMutation } from '@/app/(with-sidebar)/issue/hooks/react-query/use-issue-mutation';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import { generateRandomNickname } from '@/lib/utils/nickname';
import { useModalStore } from '../use-modal-store';
import * as S from './issue-create-modal.styles';

export default function CreateIssueModal() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [ownerNickname, setOwnerNickname] = useState(generateRandomNickname());
  const { closeModal } = useModalStore();

  const { mutate, isPending } = useQuickStartMutation();

  const handleQuickStart = async () => {
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
  };

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

        <S.Footer>
          <S.SubmitButton
            type="button"
            onClick={handleQuickStart}
          >
            이슈 생성
          </S.SubmitButton>
        </S.Footer>
      </S.Container>
      {isPending && <LoadingOverlay message="이슈를 생성하고 있습니다" />}
    </>
  );
}
