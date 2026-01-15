'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useIdeaStore } from '@/app/(with-sidebar)/issue/store/use-idea-store';
import { useModalStore } from '@/components/modal/use-modal-store';
import { useIssueStatusMutations } from '../../hooks/queries/use-issue-mutation';
import * as S from './close-issue-modal.styles';

interface CloseIssueModalProps {
  issueId: string;
}

export default function CloseIssueModal({ issueId }: CloseIssueModalProps) {
  const { ideas } = useIdeaStore(issueId);
  const { close } = useIssueStatusMutations(issueId);
  const { closeModal } = useModalStore();
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const selectedIdea = ideas.find((idea) => idea.isSelected);

  const closeAndGoSummary = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      close.mutate();
      closeModal();
      router.push(`/issue/${issueId}/summary`);
    } catch (error) {
      console.error('이슈 종료 실패:', error);
      toast.error('이슈 종료에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [issueId, selectedIdea?.id, memo, isLoading, closeModal, router]);

  return (
    <S.Container>
      <S.InfoBox>
        <S.Label>선택된 아이디어</S.Label>
        {selectedIdea ? (
          <>
            <S.Content>{selectedIdea.content || '내용 없음'}</S.Content>
            <S.Meta>작성자: {selectedIdea.author}</S.Meta>
          </>
        ) : (
          <S.Empty>선택된 아이디어가 없습니다.</S.Empty>
        )}
      </S.InfoBox>

      <div>
        <S.MemoLabel htmlFor="close-issue-memo">메모</S.MemoLabel>
        <S.MemoInputWrapper>
          <S.MemoInput
            id="close-issue-memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="메모를 입력해주세요."
          />
        </S.MemoInputWrapper>
      </div>

      <S.Footer>
        <S.SubmitButton
          type="button"
          onClick={closeAndGoSummary}
          disabled={isLoading}
        >
          {isLoading ? '종료 중...' : '종료'}
        </S.SubmitButton>
      </S.Footer>
    </S.Container>
  );
}
