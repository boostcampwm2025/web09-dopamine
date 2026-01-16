'use client';

import { IssueJoinModalProps, useIssueJoinModal } from '../../hooks/use-issue-join-modal';
import * as S from './issue-join-modal.styles';

export default function IssueJoinModal({ issueId }: IssueJoinModalProps) {
  const { nickname, isLoading, setNickname, handleJoin } = useIssueJoinModal({ issueId });
  return (
    <S.Container>
      <S.InfoContainer>
        <S.InputWrapper>
          <S.InputTitle>표시될 닉네임</S.InputTitle>
          <S.Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예) 생각하는 단무지"
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
