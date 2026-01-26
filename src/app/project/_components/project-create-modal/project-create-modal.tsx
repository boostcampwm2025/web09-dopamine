'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useModalStore } from '@/components/modal/use-modal-store';
import { useCreateProjectMutation } from '@/hooks/project';
import * as S from './project-create-modal.styles';

export default function ProjectCreateModal() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const { setIsPending, isOpen } = useModalStore();
  const { mutate, isPending } = useCreateProjectMutation();

  useEffect(() => {
    setIsPending(isPending);
  }, [isPending, setIsPending]);

  const handleSubmit = useCallback(async () => {
    if (!projectName.trim()) {
      toast.error('프로젝트 이름을 입력해주세요.');
      return;
    }

    mutate(
      { title: projectName, description: description || undefined },
      {
        onSuccess: (newProject) => {
          toast.success('프로젝트가 생성되었습니다!');
          useModalStore.getState().closeModal();
          router.push(`/project/${newProject.id}`);
        },
        onError: (error: any) => {
          toast.error(error.message || '프로젝트 생성에 실패했습니다.');
        },
      },
    );
  }, [projectName, description, mutate, router]);

  useEffect(() => {
    if (isOpen) {
      useModalStore.setState({
        onSubmit: handleSubmit,
      });
    }
  }, [isOpen, handleSubmit]);

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>프로젝트 이름</S.InputTitle>
          <S.Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="이름을 입력하세요"
            autoFocus
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isPending && projectName.trim()) {
                handleSubmit();
              }
            }}
          />
        </S.InputWrapper>
        <S.InputWrapper>
          <S.InputTitle>설명 (선택)</S.InputTitle>
          <S.Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
            disabled={isPending}
            rows={3}
          />
        </S.InputWrapper>
      </S.InfoContainer>
    </S.Container>
  );
}
