import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useModalStore } from '@/components/modal/use-modal-store';
import { useIssueMemberMutations, useNicknameMutations } from './queries/use-issue-member-mutation';

export interface IssueJoinModalProps {
  issueId: string;
}

export function useIssueJoinModal({ issueId }: IssueJoinModalProps) {
  const { closeModal } = useModalStore();

  const { generate, checkDuplicate } = useNicknameMutations(issueId);
  const { join } = useIssueMemberMutations(issueId);

  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generate.mutate(undefined, {
      onSuccess: (data) => {
        if (data?.nickname) {
          setNickname(data.nickname);
        }
      },
    });
  }, []);

  const isValidInput = (): boolean => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return false;
    }
    return true;
  };

  const validateNickname = async (): Promise<boolean> => {
    try {
      const result = await checkDuplicate(nickname);
      if (result.isDuplicate) {
        toast.error('이미 사용 중인 닉네임입니다. 다른 닉네임을 써주세요!');
        setIsLoading(false);
        return false;
      }
      return true;
    } catch (error) {
      toast.error('잠시 후 다시 시도해주세요.');
      setIsLoading(false);
      return false;
    }
  };

  const handleJoin = async () => {
    // 입력 검증
    if (!isValidInput()) return;

    setIsLoading(true);

    // 닉네임 중복 확인 (함수 안에서 실패 시 로딩 끄고 false 리턴함)
    const isAvailable = await validateNickname();
    if (!isAvailable) return;

    // 이슈 조인
    try {
      join.mutate(nickname, {
        onSuccess: () => {
          closeModal();
        },
      });
    } catch (error) {
      console.error('이슈 참여 실패:', error);
      toast.error('이슈 참여에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    nickname,
    isLoading,
    setNickname,
    handleJoin,
  };
}
