'use client';

import * as PS from '../../page.styles';
import * as S from './vote-result.styles';

type VoteResultProps = {
  participants: number;
  totalVotes: number;
  maxCommentCount: number;
};

export default function VoteResult({ participants, totalVotes, maxCommentCount }: VoteResultProps) {
  return (
    <S.Container>
      <PS.HeaderTitle>투표 결과</PS.HeaderTitle>
      <S.VoteBox>
        <S.TableRow>
          <S.OptionText>참여자</S.OptionText>
          <S.VoteCountText>{participants}명</S.VoteCountText>
        </S.TableRow>
        <S.divider />
        <S.TableRow>
          <S.OptionText>총 투표수</S.OptionText>
          <S.VoteCountText highlight>{totalVotes}표</S.VoteCountText>
        </S.TableRow>
        <S.divider />
        <S.TableRow>
          <S.OptionText>최다 댓글</S.OptionText>
          <S.VoteCountText>{maxCommentCount}개</S.VoteCountText>
        </S.TableRow>
      </S.VoteBox>
    </S.Container>
  );
}
