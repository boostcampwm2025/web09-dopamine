'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useUpdateProjectMutation } from '@/app/(with-sidebar)/project/hooks/use-project-mutation';
import { useCreateTopicMutation } from '@/app/(with-sidebar)/topic/hooks/use-topic-mutation';
import { useModalStore } from '@/components/modal/use-modal-store';
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from '@/constants/project';
import { isProjectTitleTooLong } from '@/lib/utils/project-title';

type ProjectModalProps =
  | {
      variant: 'topic';
      projectId?: string;
    }
  | {
      variant: 'project';
      projectId: string;
      currentTitle?: string;
      currentDescription?: string;
    };

export default function useProjectModal(props: ProjectModalProps) {
  const router = useRouter();
  const params = useParams();
  const isProject = props.variant === 'project';
  const projectProps = isProject ? props : null;
  const resolvedProjectId =
    props.variant === 'topic'
      ? (props.projectId ?? (params.id as string | undefined))
      : props.projectId;
  const [topicName, setTopicName] = useState('');
  const [title, setTitle] = useState(projectProps?.currentTitle);
  const [description, setDescription] = useState(projectProps?.currentDescription);
  const { closeModal } = useModalStore();
  const titleLength = title?.length || 0;
  const isTitleOverLimit = titleLength > MAX_TITLE_LENGTH;
  const isTitleLessLimit = titleLength < 1;
  const descriptionLength = description?.length || 0;
  const isDescriptionOverLimit = descriptionLength > MAX_DESCRIPTION_LENGTH;
  const isDescriptionLessLimit = descriptionLength < 1;
  const { mutate, isPending } = useCreateTopicMutation();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProjectMutation();

  const handleCreate = async () => {
    if (!topicName.trim()) {
      toast.error('토픽 이름을 입력해주세요.');
      return;
    }

    if (!resolvedProjectId) {
      toast.error('프로젝트 ID를 찾을 수 없습니다.');
      return;
    }

    mutate(
      { title: topicName, projectId: resolvedProjectId },
      {
        onSuccess: () => {
          toast.success('토픽이 생성되었습니다!');
          closeModal();
          router.refresh();
        },
      },
    );
  };

  const handleEdit = async () => {
    if (!projectProps) {
      return;
    }

    const nextTitle = title!.trim() || projectProps.currentTitle?.trim() || '';
    const nextDescription = description!.trim() || projectProps.currentDescription?.trim();

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
        id: projectProps.projectId,
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

  const submitHandler = isProject ? handleEdit : handleCreate;
  const pendingState = isProject ? isUpdating : isPending;
  const submitLabel = isProject ? '저장' : pendingState ? '생성 중...' : '만들기';

  return {
    MAX_TITLE_LENGTH,
    MAX_DESCRIPTION_LENGTH,
    isProject,
    projectProps,
    resolvedProjectId,
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
  };
}

export type { ProjectModalProps };
