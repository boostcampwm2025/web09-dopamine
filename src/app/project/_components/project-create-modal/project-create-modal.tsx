'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCreateProjectMutation } from '@/hooks/project';
import { useModalStore } from '@/components/modal/use-modal-store';
import * as S from './project-create-modal.styles';

export default function ProjectCreateModal() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const { closeModal } = useModalStore();
  const { mutate, isPending } = useCreateProjectMutation();

  const handleCreate = async () => {
    if (!projectName.trim()) {
      toast.error('프로젝트 이름을 입력해주세요.');
      return;
    }

    mutate(
      { title: projectName, description },
      {
        onSuccess: (newProject) => {
          toast.success('프로젝트가 생성되었습니다!');
          closeModal();
          router.push(`/project/${newProject.id}`);
        },
      },
    );
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>프로젝트 이름</S.InputTitle>
          <S.Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="이름을 입력하세요"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isPending) {
                handleCreate();
              }
            }}
            autoFocus
            disabled={isPending}
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

      <S.Footer>
        <S.CancelButton
          type="button"
          onClick={handleCancel}
          disabled={isPending}
        >
          취소
        </S.CancelButton>
        <S.SubmitButton
          type="button"
          onClick={handleCreate}
          disabled={isPending}
        >
          {isPending ? '생성 중...' : '만들기'}
        </S.SubmitButton>
      </S.Footer>
    </S.Container>
  );
}
