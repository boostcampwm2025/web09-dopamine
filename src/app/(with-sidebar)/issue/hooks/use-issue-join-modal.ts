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

  const isValidInput = (): boolean => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return false;
    }
    return true;
  };

  const validateNickname = async (): Promise<boolean> => {
    try {
      const result = await checkDuplicate(issueId, nickname);
      if (result.isDuplicate) {
        toast.error('이미 사용 중인 닉네임입니다. 다른 이름을 써주세요!');
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

  // 가입 성공 후 상태 업데이트 함수 (멤버 리스트 갱신)
  const updateAfterJoin = async (userId: string) => {
    // 이슈별 userId 저장
    setUserIdForIssue(issueId, userId);
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
      const result = await joinIssue(issueId, nickname.trim());

      if (result?.userId) {
        // 성공 후 처리 로직
        await updateAfterJoin(result.userId);
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
