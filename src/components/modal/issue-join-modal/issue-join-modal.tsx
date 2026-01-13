'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { getIssueMembers, joinIssue } from '@/lib/api/issue';
import { setUserIdForIssue } from '@/lib/storage/issue-user-storage';
import type { IssueMember } from '@/types/issue';
import { useModalStore } from '../use-modal-store';
import * as S from './issue-join-modal.styles';

interface IssueJoinModalProps {
  issueId: string;
  onJoinSuccess?: () => void;
}

export default function IssueJoinModal({ issueId, onJoinSuccess }: IssueJoinModalProps) {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { closeModal } = useModalStore();
  const { setMembers } = useIssueStore((state) => state.actions);

  const handleJoin = async () => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return;
    }

    setIsLoading(true);
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

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>표시될 닉네임</S.InputTitle>
          <S.Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="생각하는 단무지"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleJoin();
              }
            }}
            disabled={isLoading}
          />
        </S.InputWrapper>
      </S.InfoContainer>

      <S.Footer>
        <S.SubmitButton
          type="button"
          onClick={handleJoin}
          disabled={isLoading || !nickname.trim()}
        >
          {isLoading ? '참여 중...' : '참여하기'}
        </S.SubmitButton>
      </S.Footer>
    </S.Container>
  );
}
