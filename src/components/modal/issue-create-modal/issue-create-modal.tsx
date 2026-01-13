'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createQuickIssue } from '@/lib/api/issue';
import { setUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { generateRandomNickname } from '@/lib/utils/nickname';
import { useModalStore } from '../use-modal-store';
import * as S from './issue-create-modal.styles';

export default function CreateIssueModal() {
  const [title, setTitle] = useState('');
  const [ownerNickname, setOwnerNickname] = useState(generateRandomNickname());
  const router = useRouter();
  const { closeModal } = useModalStore();

  const handleQuickStart = async () => {
    if (!title.trim() || !ownerNickname.trim()) {
      toast.error('이슈 제목과 닉네임을 입력해주세요.');
      return;
    }

    const result = await createQuickIssue(title, ownerNickname);

    if (result?.issueId) {
      // 이슈별로 userId 저장
      setUserIdForIssue(result.issueId, result.userId);
      closeModal();
      router.push(`/issue/${result.issueId}`);
    } else {
      toast.error('이슈 생성이 실패했습니다.');
      console.error('이슈 생성에 실패했습니다.');
    }
  };

  return (
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
  );
}
