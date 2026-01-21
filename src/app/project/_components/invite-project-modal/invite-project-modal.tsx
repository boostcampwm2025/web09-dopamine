'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useModalStore } from '@/components/modal/use-modal-store';
import * as S from './invite-project-modal.styles';

interface InviteModalProps {
  id: string;
  title: string;
}
export default function InviteProjectModal({ id, title }: InviteModalProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const { closeModal } = useModalStore();

  const addTag = (email: string) => {
    const trimmedEmail = email.trim();
    if (trimmedEmail === '') return;

    if (tags.includes(trimmedEmail)) {
      toast.error('이미 포함된 이메일입니다.');
      return;
    }

    if (tags.length >= 10) {
      toast.error('한번에 10개까지 추가할 수 있습니다');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setTags([...tags, trimmedEmail]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleInvite = () => {};

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
          <S.InputTitle>이메일 입력 ({tags.length}/10)</S.InputTitle>
          <S.Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="murphy@example.com"
            autoComplete="off"
          />
        </S.InputWrapper>
        <S.TagList>
          {tags.map((tag, i) => {
            return (
              <S.TagListItem key={tag}>
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(i)}
                >
                  &times;
                </button>
              </S.TagListItem>
            );
          })}
        </S.TagList>
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
