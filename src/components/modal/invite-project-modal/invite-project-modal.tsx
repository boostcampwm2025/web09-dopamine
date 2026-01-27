'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useModalStore } from '@/components/modal/use-modal-store';
import { useInvitationMutations } from '@/hooks/invitation';
import * as S from './invite-project-modal.styles';

interface InviteModalProps {
  id: string;
  title: string;
}
export default function InviteProjectModal({ id, title }: InviteModalProps) {
  const { data: session } = useSession();
  const { createToken } = useInvitationMutations(id);
  const [tags, setTags] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [inputValue, setInputValue] = useState('');
  const { setIsPending, isOpen } = useModalStore();
  const handleInviteRef = useRef<(() => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    setIsPending(createToken.isPending);
  }, [createToken.isPending, setIsPending]);

  const resetCode = () => {
    if (code) setCode('');
  };

  const addTag = (email: string) => {
    const trimmedEmail = email.trim();
    if (trimmedEmail === '') return;

    if (tags.includes(trimmedEmail)) {
      toast.error('이미 포함된 이메일입니다.');
      return;
    }

    if (tags.length >= 10) {
      toast.error('한번에 10개까지 추가할 수 있습니다.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('올바른 이메일 형식이 아닙니다.');
      return;
    }

    if (session?.user.email === trimmedEmail) {
      toast.error('현재 로그인 중인 계정입니다.');
      return;
    }

    setTags([...tags, trimmedEmail]);
    setInputValue('');
    resetCode();
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
    resetCode();
  };

  const handleResetTag = () => {
    setTags([]);
    resetCode();
  };

  const handleCopy = useCallback(async (code: string) => {
    // 1. 현재 도메인 + 프로젝트 경로 + 초대코드 조합
    const fullUrl = `${window.location.origin}/invite?code=${code}`;

    try {
      // 2. 클립보드에 쓰기
      await navigator.clipboard.writeText(fullUrl);
      toast.success('초대 링크를 복사했습니다!');
    } catch (err) {
      console.error('복사 실패:', err);
      toast.error('초대 링크를 클립보드에 복사할 수 없습니다.');
    }
  }, []);

  const handleInvite = useCallback(async () => {
    if (inputValue.trim()) {
      toast.error('입력 중인 이메일이 있습니다.');
      return;
    }

    if (tags.length === 0) {
      toast.error('이메일을 입력해주세요!');
      return;
    }

    createToken.mutate(tags, {
      onSuccess: (data) => {
        const { token } = data;
        setCode(token);
        handleCopy(token);
      },
    });
  }, [inputValue, tags, createToken, handleCopy]);

  useEffect(() => {
    handleInviteRef.current = handleInvite;
  }, [handleInvite]);

  useEffect(() => {
    if (isOpen) {
      // code가 있으면 버튼 비활성화 (onSubmit 제거)
      useModalStore.setState({
        onSubmit: code
          ? undefined
          : async () => {
              await handleInviteRef.current?.();
            },
        submitButtonText: '초대 링크 생성',
      });
    }
  }, [isOpen, code]);

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>프로젝트 이름</S.InputTitle>
          <S.Title>{title}</S.Title>
        </S.InputWrapper>
        <S.InputWrapper>
          <S.EmailInputTitle>
            초대 이메일 ({tags.length}/10){' '}
            {tags.length > 0 && (
              <S.ResetButton
                type="button"
                onClick={handleResetTag}
              >
                초기화
              </S.ResetButton>
            )}
          </S.EmailInputTitle>
          <S.Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="초대할 이메일을 입력하고 Enter를 눌러주세요."
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
        {code && (
          <>
            <S.Divider />
            <S.SuccessSection>
              <S.SuccessMessage>✓ 초대 링크가 생성되었습니다</S.SuccessMessage>
              <S.CopyLinkButton
                type="button"
                onClick={() => handleCopy(code)}
              >
                링크 다시 복사하기
              </S.CopyLinkButton>
            </S.SuccessSection>
          </>
        )}
      </S.InfoContainer>
    </S.Container>
  );
}
