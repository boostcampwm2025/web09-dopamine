'use client';

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
            disabled={!isOwner}
          />
        </S.MemoInputWrapper>
      </div>

      <S.Footer>
        <S.SubmitButton
          type="button"
          onClick={closeAndGoSummary}
          disabled={isLoading || !isOwner}
        >
          {isLoading ? '종료 중...' : '종료'}
        </S.SubmitButton>
      </S.Footer>
    </S.Container>
  );
}
