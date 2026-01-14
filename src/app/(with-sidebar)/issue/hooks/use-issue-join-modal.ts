import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useModalStore } from '@/components/modal/use-modal-store';
import { getIssueMembers, joinIssue } from '@/lib/api/issue';
import { setUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { IssueMember } from '@/types/issue';
import { useIssueStore } from '../store/use-issue-store';
import { useNicknameGenerateQuery, useNicknameValidator } from './queries/use-issue-member-query';

export interface IssueJoinModalProps {
  issueId: string;
  onJoinSuccess?: () => void;
}

export function useIssueJoinModal({ issueId, onJoinSuccess }: IssueJoinModalProps) {
  const { setMembers } = useIssueStore((state) => state.actions);
  const { closeModal } = useModalStore();

  const { data: generateData } = useNicknameGenerateQuery(issueId);
  const { checkDuplicate } = useNicknameValidator();

  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (generateData?.nickname) {
      setNickname(generateData?.nickname);
    }
  }, [generateData]);

  const handleJoin = async () => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await checkDuplicate(issueId, nickname);
      if (result.isDuplicate) {
        toast.error('이미 사용 중인 닉네임입니다. 다른 이름을 써주세요!');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      toast.error('잠시 후 다시 시도해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await joinIssue(issueId, nickname.trim());

      if (result?.userId) {
        // 이슈별 userId 저장
        setUserIdForIssue(issueId, result.userId);

        // 멤버 리스트 다시 가져오기
        const updatedMembers = await getIssueMembers(issueId);
        if (updatedMembers) {
          const mappedMembers: IssueMember[] = updatedMembers.map((member: IssueMember) => ({
            id: member.id,
            displayName: member.displayName,
            role: member.role,
            isConnected: member.isConnected ?? false,
          }));
          setMembers(mappedMembers);
        }

        toast.success('이슈에 참여했습니다!');
        closeModal();
        onJoinSuccess?.();
      } else {
        toast.error('이슈 참여에 실패했습니다.');
      }
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
