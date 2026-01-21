'use client';

import { useState } from 'react';
import { useModalStore } from '@/components/modal/use-modal-store';
import * as S from './invite-project-modal.styles';

interface InviteModalProps {
  id: string;
  title: string;
}
export default function InviteProjectModal({ id, title }: InviteModalProps) {
  const [email, setEmail] = useState([]);
  const { closeModal } = useModalStore();

  const handleInvite = async () => {};

  const handleCancel = () => {
    closeModal();
  };

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>프로젝트 이름</S.InputTitle>
          <S.Title>{title}</S.Title>
        </S.InputWrapper>
        <S.InputWrapper>
          <S.InputTitle>이메일 입력</S.InputTitle>
          <S.Input placeholder="murphy@example.com" />
        </S.InputWrapper>
      </S.InfoContainer>

      <S.Footer>
        <S.CancelButton
          type="button"
          onClick={handleCancel}
        >
          취소
        </S.CancelButton>
        <S.SubmitButton
          type="button"
          onClick={handleInvite}
        >
          {'초대 링크 생성'}
        </S.SubmitButton>
      </S.Footer>
    </S.Container>
  );
}
