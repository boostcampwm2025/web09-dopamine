'use client';

import { VOTE_TYPE } from '@/constants/issue';
import type { CardStatus } from '../../types/idea';
import * as S from './idea-card.styles';

type VoteType = (typeof VOTE_TYPE)[keyof typeof VOTE_TYPE];

interface IdeaCardFooterProps {
  isVoteButtonVisible?: boolean;
  status?: CardStatus;
  myVote?: VoteType | null;
  agreeCount?: number;
  disagreeCount?: number;
  isVoteDisabled?: boolean;
  onAgree: () => void;
  onDisagree: () => void;
}

export default function IdeaCardFooter({
  isVoteButtonVisible,
  status,
  myVote,
  agreeCount,
  disagreeCount,
  isVoteDisabled,
  onAgree,
  onDisagree,
}: IdeaCardFooterProps) {
  if (!isVoteButtonVisible) {
    return null;
  }

  return (
    <S.Footer>
      <S.VoteButton
        kind={VOTE_TYPE.AGREE}
        cardStatus={status}
        active={myVote === VOTE_TYPE.AGREE}
        onClick={onAgree}
        disabled={isVoteDisabled}
        data-no-canvas-close="true"
      >
        찬성 {agreeCount}
      </S.VoteButton>
      <S.VoteButton
        kind={VOTE_TYPE.DISAGREE}
        cardStatus={status}
        active={myVote === VOTE_TYPE.DISAGREE}
        onClick={onDisagree}
        disabled={isVoteDisabled}
        data-no-canvas-close="true"
      >
        반대 {disagreeCount}
      </S.VoteButton>
    </S.Footer>
  );
}
