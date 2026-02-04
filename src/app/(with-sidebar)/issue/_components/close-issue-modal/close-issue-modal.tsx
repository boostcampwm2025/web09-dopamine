'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useModalStore } from '@/components/modal/use-modal-store';
import * as S from './close-issue-modal.styles';
import { useCloseIssueModal } from './use-close-issue-modal';

interface CloseIssueModalProps {
  issueId: string;
  isOwner?: boolean;
}

export default function CloseIssueModal({ issueId, isOwner = false }: CloseIssueModalProps) {
  const { memo, setMemo, selectedIdea, isLoading, closeAndGoSummary } = useCloseIssueModal({
    issueId,
    isOwner,
  });
  const { setIsPending, isOpen } = useModalStore();
  const closeAndGoSummaryRef = useRef<(() => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    setIsPending(isLoading);
  }, [isLoading, setIsPending]);

  useEffect(() => {
    closeAndGoSummaryRef.current = closeAndGoSummary;
  }, [closeAndGoSummary]);

  const handleSubmit = useCallback(async () => {
    await closeAndGoSummaryRef.current?.();
  }, []);

  useEffect(() => {
    useModalStore.setState({
      onSubmit: handleSubmit,
      submitButtonText: '이슈 종료',
    });
  }, [handleSubmit]);

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
        <S.MemoLabel htmlFor="close-issue-memo">메모 (선택)</S.MemoLabel>
        <S.MemoInputWrapper>
          <S.MemoInput
            id="close-issue-memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="메모를 입력해주세요."
            disabled={!isOwner}
          />
        </S.MemoInputWrapper>
      </div>
    </S.Container>
  );
}
