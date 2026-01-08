'use client';

import * as S from './vote-result.styles';
import * as PS from '../../page.styles';

export default function VoteResult() {
    return (
        <S.Container>
            <PS.HeaderTitle>투표 결과</PS.HeaderTitle>
            <S.VoteBox>
                <S.TableRow>
                    <S.OptionText>참여자</S.OptionText>
                    <S.VoteCountText>4명</S.VoteCountText>
                </S.TableRow>
                <S.divider />
                <S.TableRow>
                    <S.OptionText>총 투표수</S.OptionText>
                    <S.VoteCountText highlight>30표</S.VoteCountText>
                </S.TableRow>
                <S.divider />
                <S.TableRow>
                    <S.OptionText>최다 댓글</S.OptionText>
                    <S.VoteCountText>2개</S.VoteCountText>
                </S.TableRow>
            </S.VoteBox>
        </S.Container>
    )
}