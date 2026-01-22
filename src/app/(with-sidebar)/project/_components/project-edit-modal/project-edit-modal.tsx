'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useUpdateProjectMutation } from '@/app/(with-sidebar)/project/hooks/use-project-mutation';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import { useModalStore } from '@/components/modal/use-modal-store';
import { isProjectTitleTooLong } from '@/lib/utils/project-title';
import { maxDescriptionLength, maxTitleLength } from '@/types/project';
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
  const [titleLength, setTitleLength] = useState(title!.length);
  const isTitleOverLimit = titleLength > maxTitleLength;
  const isTitleLessLimit = titleLength < 1;
  const [descriptionLength, setDescriptionLength] = useState(description!.length);
  const isDescriptionOverLimit = descriptionLength > maxDescriptionLength;
  const isDescriptionLessLimit = descriptionLength < 1;
  const { mutate, isPending } = useUpdateProjectMutation();

  useEffect(() => {
    setTitleLength(title?.length || 0);
    setDescriptionLength(description?.length || 0);
  }, [title, description]);

  const handleEdit = async () => {
    const nextTitle = title!.trim() || currentTitle?.trim() || '';
    const nextDescription = description!.trim() || currentDescription?.trim();

    if (!nextTitle) {
      toast.error('프로젝트 제목을 입력해주세요.');
      return;
    }

    if (isProjectTitleTooLong(nextTitle)) {
      toast.error(`프로젝트 제목은 ${maxTitleLength}자 이하로 입력해주세요.`);
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
                {titleLength}/{maxTitleLength}
              </S.CharCount>
            </S.InputRow>
            {(isTitleOverLimit || isTitleLessLimit) && (
              <S.InputDescription>
                * 프로젝트 제목은 1~{maxTitleLength}자 이내로 입력해주세요.
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
                {descriptionLength}/{maxDescriptionLength}
              </S.CharCount>
            </S.InputRow>
            {(isDescriptionOverLimit || isDescriptionLessLimit) && (
              <S.InputDescription>
                * 프로젝트 설명은 1~{maxDescriptionLength}자 이내로 입력해주세요.
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
