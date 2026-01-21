'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuickStartMutation } from '@/app/(with-sidebar)/issue/hooks';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import { generateRandomNickname } from '@/lib/utils/nickname';
import { useModalStore } from '../use-modal-store';
import * as S from './project-edit-modal.styles';

interface EditProjectModalProps {
  currentTitle?: string;
  currentDescription?: string;
}

export default function EditProjectModal({ currentTitle, currentDescription }: EditProjectModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const { closeModal } = useModalStore();

  const { mutate, isPending } = useQuickStartMutation();

  const handleQuickStart = async () => {
    if (!title?.trim()) {
      toast.error('프로젝트 이름을 입력해주세요.');
      return;
    }

    //To Do 백엔드 로직 연결

    // mutate(
    //   { title, description, },
    //   {
    //     onSuccess: (newIssue) => {
    //       closeModal();
    //       router.push(`/project/${newIssue.issueId}`);
    //     },
    //   },
    // );
  };

  return (
    <>
      <S.Container>
        <S.InfoContainer>
          <S.InputWrapper>
            <S.InputTitle>프로젝트 제목</S.InputTitle>
            <S.Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={title || '프로젝트 제목을 입력해주세요.'}
            />
          </S.InputWrapper>
          <S.InputWrapper>
            <S.InputTitle>프로젝트 설명</S.InputTitle>
            <S.Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={description || '프로젝트 설명을 입력해주세요.'}
            />
          </S.InputWrapper>
        </S.InfoContainer>

        <S.Footer>
          <S.SubmitButton
            type="button"
            onClick={handleQuickStart}
          >
            저장
          </S.SubmitButton>
        </S.Footer>
      </S.Container>
      {isPending && <LoadingOverlay message="변경사항을 저장중입니다." />}
    </>
  );
}
