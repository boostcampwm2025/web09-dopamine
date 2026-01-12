'use client';

import { useCallback, useState } from 'react';
import { useIdeaStore } from '@/app/(with-sidebar)/issue/store/use-idea-store';
import { useModalStore } from '@/components/modal/use-modal-store';
import * as S from './close-issue-modal.styles';
import { usePathname, useRouter } from 'next/navigation';

interface CloseIssueModalProps {
  issueId: string;
}

export default function CloseIssueModal({ issueId }: CloseIssueModalProps) {
  const { ideas } = useIdeaStore(issueId);
  const { closeModal } = useModalStore();
  const [memo, setMemo] = useState('');
  const router = useRouter();
  const selectedIdea = ideas.find((idea) => idea.isSelected);

  const closeAndGoSummary = useCallback(() => {
    closeModal();
    router.push('/issue/summary');
  }, []);

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
        >
          종료
        </S.SubmitButton>
      </S.Footer>
    </S.Container>
  );
}
