'use client';

import React from 'react';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import useProjectModal, { ProjectModalProps } from './use-project-modal';
import * as S from '@/app/(with-sidebar)/project/_components/project-modal/project-modal.styles';

export default function ProjectModal(props: ProjectModalProps) {
  const {
    MAX_TITLE_LENGTH,
    MAX_DESCRIPTION_LENGTH,
    isProject,
    projectProps,
    topicName,
    setTopicName,
    title,
    setTitle,
    description,
    setDescription,
    titleLength,
    isTitleOverLimit,
    isTitleLessLimit,
    descriptionLength,
    isDescriptionOverLimit,
    isDescriptionLessLimit,
    isPending,
    isUpdating,
    submitHandler,
    pendingState,
    submitLabel,
    handleCreate,
  } = useProjectModal(props);
  const variant = isProject ? 'project' : 'topic';

  const renderProjectFields = () => (
    <>
      <S.InputWrapper>
        <S.InputTitle>프로젝트 제목</S.InputTitle>
        <S.InputRow>
          <S.Input
            $variant="project"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={projectProps?.currentTitle ?? '프로젝트 제목을 입력해주세요.'}
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
            placeholder={projectProps?.currentDescription ?? '프로젝트 설명을 입력해주세요.'}
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
    </>
  );

  const renderTopicFields = () => (
    <S.InputWrapper>
      <S.InputTitle>토픽 이름</S.InputTitle>
      <S.Input
        $variant="topic"
        value={topicName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopicName(e.target.value)}
        placeholder="이름을 입력하세요"
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter' && !isPending) {
            handleCreate();
          }
        }}
        autoFocus
        disabled={isPending}
      />
    </S.InputWrapper>
  );

  return (
    <>
      <S.Container $variant={variant}>
        <S.InfoContainer $variant={variant}>
          {isProject ? renderProjectFields() : renderTopicFields()}
        </S.InfoContainer>

        <S.Footer>
          <S.SubmitButton
            $variant={variant}
            type="button"
            onClick={submitHandler}
            disabled={!isProject && pendingState}
          >
            {submitLabel}
          </S.SubmitButton>
        </S.Footer>
      </S.Container>
      {isProject && isUpdating && <LoadingOverlay message="변경사항을 저장중입니다." />}
    </>
  );
}
