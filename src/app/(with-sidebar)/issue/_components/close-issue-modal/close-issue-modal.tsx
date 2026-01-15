'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useSelectedIdeaQuery } from '@/app/(with-sidebar)/issue/hooks/queries/use-selected-idea-query';
import { useIdeaStore } from '@/app/(with-sidebar)/issue/store/use-idea-store';
import { useModalStore } from '@/components/modal/use-modal-store';
import { ISSUE_STATUS } from '@/constants/issue';
import { updateIssueStatus } from '@/lib/api/issue';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { useIssueStatusMutations } from '../../hooks/queries/use-issue-mutation';
import * as S from './close-issue-modal.styles';

interface CloseIssueModalProps {
  issueId: string;
  isOwner?: boolean;
}

export default function CloseIssueModal({ issueId, isOwner = false }: CloseIssueModalProps) {
  const { ideas } = useIdeaStore(issueId);
  const { data: selectedIdeaId } = useSelectedIdeaQuery(issueId);
  const { close } = useIssueStatusMutations(issueId);
  const { closeModal } = useModalStore();
  const userId = getUserIdForIssue(issueId) ?? '';

  // 방장이 모달을 닫을 때 브로드캐스팅하는 함수
  const handleClose = useCallback(async () => {
    if (isOwner) {
      // 방장이 모달을 닫을 때 브로드캐스팅
      try {
        await fetch(`/api/issues/${issueId}/close-modal`, {
          method: 'DELETE',
          headers: {
            'x-user-id': userId,
          },
        });
      } catch (error) {
        console.error('Failed to broadcast close modal:', error);
      }
    }
    closeModal();
  }, [issueId, userId, isOwner, closeModal]);

  // 방장이 ESC 키로 모달을 닫을 때 브로드캐스팅
  useEffect(() => {
    if (!isOwner) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        await handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOwner, handleClose]);

  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const selectedIdea = selectedIdeaId
    ? ideas.find((idea) => idea.id === selectedIdeaId)
    : undefined;

  // 메모 변경 시 debounce하여 브로드캐스팅
  useEffect(() => {
    if (!isOwner) return;

    const timeoutId = setTimeout(() => {
      // 방장이 메모를 변경할 때 브로드캐스팅
      fetch(`/api/issues/${issueId}/close-modal`, {
        method: 'PATCH',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memo }),
      }).catch((error) => {
        console.error('Failed to broadcast memo update:', error);
      });
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [memo, issueId, userId, isOwner]);

  // SSE 이벤트로 메모 업데이트 수신
  useEffect(() => {
    const handleMemoUpdate = (event: CustomEvent<{ memo: string }>) => {
      // 방장이 아닌 경우에만 메모 업데이트 (방장은 이미 입력 중)
      if (!isOwner && event.detail.memo !== undefined) {
        setMemo(event.detail.memo);
      }
    };

    window.addEventListener('close-modal-memo-updated', handleMemoUpdate as EventListener);
    return () => {
      window.removeEventListener('close-modal-memo-updated', handleMemoUpdate as EventListener);
    };
  }, [isOwner]);

  const closeAndGoSummary = useCallback(async () => {
    if (!isOwner) {
      toast.error('방장만 이슈를 종료할 수 있습니다.');
      return;
    }

    if (isLoading) return;
    if (!selectedIdea) {
      toast.error('채택할 아이디어를 선택하세요.');
      return;
    }

    try {
      setIsLoading(true);
      await updateIssueStatus(issueId, ISSUE_STATUS.CLOSE, selectedIdea.id, memo || undefined);
      close.mutate();

      // 모달 닫기 브로드캐스팅
      if (isOwner) {
        try {
          await fetch(`/api/issues/${issueId}/close-modal`, {
            method: 'DELETE',
            headers: {
              'x-user-id': userId,
            },
          });
        } catch (error) {
          console.error('Failed to broadcast close modal:', error);
        }
      }

      closeModal();
      router.push(`/issue/${issueId}/summary`);
    } catch (error) {
      console.error('이슈 종료 실패:', error);
      toast.error('이슈 종료에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [issueId, selectedIdea?.id, memo, isLoading, isOwner, userId, closeModal, router, close]);

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
