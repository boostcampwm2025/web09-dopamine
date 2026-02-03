import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useModalStore } from '@/components/modal/use-modal-store';
import { useIssueMemberMutations, useNicknameMutations } from '@/hooks/issue';

export interface IssueJoinModalProps {
  issueId: string;
}

export function useIssueJoinModal({ issueId }: IssueJoinModalProps) {
  const { closeModal, setIsPending, isOpen } = useModalStore();

  const { generate } = useNicknameMutations(issueId);
  const { join } = useIssueMemberMutations(issueId);
  const isLoading = generate.isPending || join.isPending;

  const [nickname, setNickname] = useState('');

  // 모달의 pending 상태를 store에 동기화
  useEffect(() => {
    setIsPending(isLoading);
  }, [isLoading, setIsPending]);

  useEffect(() => {
    generate.mutate(undefined, {
      onSuccess: (data) => {
        if (data?.nickname) {
          setNickname(data.nickname);
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = useCallback(async () => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return;
    }

    join.mutate(nickname, {
      onSuccess: () => {
        closeModal();
      },
    });
  }, [nickname, join, closeModal]);

  return {
    nickname,
    isLoading,
    setNickname,
    handleJoin,
    isOpen,
  };
}
