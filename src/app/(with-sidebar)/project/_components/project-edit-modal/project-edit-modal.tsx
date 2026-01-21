'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useUpdateProjectMutation } from '@/app/project/hooks/use-project-mutation';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import { useModalStore } from '@/components/modal/use-modal-store';
import * as S from './project-edit-modal.styles';

interface EditProjectModalProps {
  projectId: string;
  currentTitle?: string;
  currentDescription?: string;
}

export default function EditProjectModal({ projectId, currentTitle, currentDescription }: EditProjectModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { closeModal } = useModalStore();

  const { mutate, isPending } = useUpdateProjectMutation();

  const handleQuickStart = async () => {
    const nextTitle = title.trim() || currentTitle?.trim() || '';
    const nextDescription = description.trim() || currentDescription?.trim();

    if (!nextTitle) {
      toast.error('프로젝트 제목을 입력해주세요.');
      return;
    }

    mutate(
      {
        id: projectId,
        title: nextTitle,
        description: nextDescription || undefined,
      },
      {
        onSuccess: () => {
          closeModal();
          router.refresh();
        },
      },
    );
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
              placeholder={currentTitle ?? '프로젝트 제목을 입력해주세요.'}
            />
          </S.InputWrapper>
          <S.InputWrapper>
            <S.InputTitle>프로젝트 설명</S.InputTitle>
            <S.Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={currentDescription ?? '프로젝트 설명을 입력해주세요.'}
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
