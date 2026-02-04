'use client';

import { useEffect, useRef } from 'react';
import { useModalStore } from '@/components/modal/use-modal-store';
import * as S from './issue-join-modal.styles';
import { IssueJoinModalProps, useIssueJoinModal } from './use-issue-join-modal';

export default function IssueJoinModal({ issueId }: IssueJoinModalProps) {
  const { nickname, isLoading, setNickname, handleJoin, isOpen } = useIssueJoinModal({ issueId });
  const handleJoinRef = useRef(handleJoin);

  handleJoinRef.current = handleJoin;

  useEffect(() => {
    if (isOpen) {
      useModalStore.setState({
        onSubmit: async () => {
          await handleJoinRef.current();
        },
      });
    }
  }, [isOpen]);

  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>표시될 닉네임</S.InputTitle>
          <S.Input>
            <S.InputField
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예) 생각하는 단무지"
              disabled={isLoading}
              autoFocus
            />
          </S.Input>
        </S.InputWrapper>
      </S.InfoContainer>
    </S.Container>
  );
}
