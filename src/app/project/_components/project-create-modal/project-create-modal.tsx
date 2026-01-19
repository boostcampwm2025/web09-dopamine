'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useModalStore } from '@/components/modal/use-modal-store';
import * as S from './project-create-modal.styles';

export default function ProjectCreateModal() {
  const [projectName, setProjectName] = useState('');
  const { closeModal } = useModalStore();

  const handleCreate = async () => {
    if (!projectName.trim()) {
      toast.error('프로젝트 이름을 입력해주세요.');
      return;
    }

    // TODO: API 연동
    toast.success('프로젝트가 생성되었습니다!');
    closeModal();
    // router.push(`/project/${newProjectId}`);
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
              if (e.key === 'Enter') {
                handleCreate();
              }
            }}
            autoFocus
          />
        </S.InputWrapper>
      </S.InfoContainer>

      <S.Footer>
        <S.CancelButton type="button" onClick={handleCancel}>
          취소
        </S.CancelButton>
        <S.SubmitButton type="button" onClick={handleCreate}>
          만들기
        </S.SubmitButton>
      </S.Footer>
    </S.Container>
  );
}
