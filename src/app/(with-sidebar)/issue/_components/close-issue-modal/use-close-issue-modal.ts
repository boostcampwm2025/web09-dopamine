import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useModalStore } from '@/components/modal/use-modal-store';
import { ISSUE_STATUS } from '@/constants/issue';
import { updateIssueStatus } from '@/lib/api/issue';
import { useIdeasWithTemp } from '../../hooks';
import { useIssueStatusMutations, useSelectedIdeaQuery } from '@/hooks/issue';

interface UseCloseIssueModalParams {
  issueId: string;
  isOwner: boolean;
}

export function useCloseIssueModal({ issueId, isOwner }: UseCloseIssueModalParams) {
  const { ideas } = useIdeasWithTemp(issueId);
  const { data: selectedIdeaId } = useSelectedIdeaQuery(issueId);
  const { close } = useIssueStatusMutations(issueId);
  const { closeModal } = useModalStore();
  const router = useRouter();

  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedIdea = selectedIdeaId
    ? ideas.find((idea) => idea.id === selectedIdeaId)
    : undefined;

  // 메모 브로드캐스팅
  const broadcastMemo = useCallback(
    async (memoValue: string) => {
      if (!isOwner) return;

      try {
        const response = await fetch(`/api/issues/${issueId}/close-modal`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ memo: memoValue }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to broadcast memo update');
        }
      } catch (error) {
        console.error('Failed to broadcast memo update:', error);
      }
    },
    [issueId, isOwner],
  );

  // 모달 닫기 브로드캐스팅
  const broadcastClose = useCallback(async () => {
    if (!isOwner) return;

    try {
      const response = await fetch(`/api/issues/${issueId}/close-modal`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to broadcast close modal');
      }
    } catch (error) {
      console.error('Failed to broadcast close modal:', error);
    }
  }, [issueId, isOwner]);

  // 메모 변경 시 debounce하여 브로드캐스팅
  useEffect(() => {
    if (!isOwner) return;

    const timeoutId = setTimeout(() => {
      broadcastMemo(memo);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [memo, isOwner, broadcastMemo]);

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

  // 모달 닫기
  const handleClose = useCallback(async () => {
    await broadcastClose();
    closeModal();
  }, [broadcastClose, closeModal]);

  // ESC 키로 모달 닫기
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

  // 이슈 종료
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
      await broadcastClose();

      closeModal();
      router.push(`/issue/${issueId}/summary`);
    } catch (error) {
      console.error('이슈 종료 실패:', error);
      toast.error('이슈 종료에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [
    issueId,
    selectedIdea?.id,
    memo,
    isLoading,
    isOwner,
    closeModal,
    router,
    close,
    broadcastClose,
  ]);

  return {
    memo,
    setMemo,
    selectedIdea,
    isLoading,
    closeAndGoSummary,
  };
}
