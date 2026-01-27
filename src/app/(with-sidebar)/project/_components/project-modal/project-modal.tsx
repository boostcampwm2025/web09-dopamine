'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import { useModalStore } from '@/components/modal/use-modal-store';
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from '@/constants/project';
import { useUpdateProjectMutation } from '@/hooks/project';
import { isProjectTitleTooLong } from '@/lib/utils/project-title';
import * as S from './project-modal.styles';

interface ProjectModalProps {
  projectId: string;
  currentTitle?: string;
  currentDescription?: string;
}

export default function ProjectModal({
  projectId,
  currentTitle,
  currentDescription,
}: ProjectModalProps) {
  const router = useRouter();
  const { setIsPending, isOpen, closeModal } = useModalStore();
  const [title, setTitle] = useState(currentTitle || '');
  const [description, setDescription] = useState(currentDescription || '');
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProjectMutation();

  useEffect(() => {
    setIsPending(isUpdating);
  }, [isUpdating, setIsPending]);

  const handleSubmit = useCallback(async () => {
    const nextTitle = title.trim() || currentTitle?.trim() || '';
    const nextDescription = description.trim() || currentDescription?.trim();

    if (!nextTitle) {
      toast.error('프로젝트 제목을 입력해주세요.');
      return;
    }

    if (isProjectTitleTooLong(nextTitle)) {
      toast.error(`프로젝트 제목은 ${MAX_TITLE_LENGTH}자 이하로 입력해주세요.`);
      return;
    }

    updateProject(
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
  }, [
    title,
    description,
    currentTitle,
    currentDescription,
    projectId,
    updateProject,
    closeModal,
    router,
  ]);

  useEffect(() => {
    if (isOpen) {
      useModalStore.setState({
        onSubmit: handleSubmit,
      });
    }
  }, [isOpen, handleSubmit]);

  const titleLength = title?.length || 0;
  const isTitleOverLimit = titleLength > MAX_TITLE_LENGTH;
  const isTitleLessLimit = titleLength < 1;
  const descriptionLength = description?.length || 0;
  const isDescriptionOverLimit = descriptionLength > MAX_DESCRIPTION_LENGTH;

  return (
    <>
      <S.Container $variant="project">
        <S.InfoContainer $variant="project">
          <S.InputWrapper>
            <S.InputTitle>프로젝트 제목</S.InputTitle>
            <S.InputRow>
              <S.Input
                $variant="project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={currentTitle ?? '프로젝트 제목을 입력해주세요.'}
              />
              <S.CharCount $isOverLimit={isTitleOverLimit}>
                {titleLength}/{MAX_TITLE_LENGTH}
              </S.CharCount>
            </S.InputRow>
            {(isTitleOverLimit || isTitleLessLimit) && (
              <S.InputDescription>
                * 프로젝트 제목은 1~{MAX_TITLE_LENGTH}자 이내로 입력해주세요.
              </S.InputDescription>
            )}
          </S.InputWrapper>
          <S.InputWrapper>
            <S.InputTitle>프로젝트 설명</S.InputTitle>
            <S.InputRow>
              <S.Textarea
                $variant="project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={currentDescription ?? '프로젝트 설명을 입력해주세요.'}
              />
              <S.CharCount $isOverLimit={isDescriptionOverLimit}>
                {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
              </S.CharCount>
            </S.InputRow>
            {isDescriptionOverLimit && (
              <S.InputDescription>
                * 프로젝트 설명은 {MAX_DESCRIPTION_LENGTH}자 이내로 입력해주세요.
              </S.InputDescription>
            )}
          </S.InputWrapper>
        </S.InfoContainer>
      </S.Container>
      {isUpdating && <LoadingOverlay message="변경사항을 저장중입니다." />}
    </>
  );
}
