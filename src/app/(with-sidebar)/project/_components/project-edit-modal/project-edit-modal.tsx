'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useUpdateProjectMutation } from '@/app/(with-sidebar)/project/hooks/use-project-mutation';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import { useModalStore } from '@/components/modal/use-modal-store';
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from '@/constants/project';
import { isProjectTitleTooLong } from '@/lib/utils/project-title';
import * as S from './project-edit-modal.styles';

interface EditProjectModalProps {
  projectId: string;
  currentTitle?: string;
  currentDescription?: string;
}

export default function EditProjectModal({
  projectId,
  currentTitle,
  currentDescription,
}: EditProjectModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const { closeModal } = useModalStore();
  const titleLength = title?.length || 0;
  const isTitleOverLimit = titleLength > MAX_TITLE_LENGTH;
  const isTitleLessLimit = titleLength < 1;
  const descriptionLength = description?.length || 0;
  const isDescriptionOverLimit = descriptionLength > MAX_DESCRIPTION_LENGTH;
  const isDescriptionLessLimit = descriptionLength < 1;
  const { mutate, isPending } = useUpdateProjectMutation();

  const handleEdit = async () => {
    const nextTitle = title!.trim() || currentTitle?.trim() || '';
    const nextDescription = description!.trim() || currentDescription?.trim();

    if (!nextTitle) {
      toast.error('프로젝트 제목을 입력해주세요.');
      return;
    }

    if (isProjectTitleTooLong(nextTitle)) {
      toast.error(`프로젝트 제목은 ${MAX_TITLE_LENGTH}자 이하로 입력해주세요.`);
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
            <S.InputRow>
              <S.Input
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={currentDescription ?? '프로젝트 설명을 입력해주세요.'}
              />
              <S.CharCount $isOverLimit={isDescriptionOverLimit}>
                {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
              </S.CharCount>
            </S.InputRow>
            {(isDescriptionOverLimit || isDescriptionLessLimit) && (
              <S.InputDescription>
                * 프로젝트 설명은 1~{MAX_DESCRIPTION_LENGTH}자 이내로 입력해주세요.
              </S.InputDescription>
            )}
          </S.InputWrapper>
        </S.InfoContainer>

        <S.Footer>
          <S.SubmitButton
            type="button"
            onClick={handleEdit}
          >
            저장
          </S.SubmitButton>
        </S.Footer>
      </S.Container>
      {isPending && <LoadingOverlay message="변경사항을 저장중입니다." />}
    </>
  );
}
