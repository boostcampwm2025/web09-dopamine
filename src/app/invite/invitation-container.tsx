import { InvitationInfoResponse } from '@/lib/api/invitation';
import * as S from './pags.styles';

interface InvitationContainerprops {
  data: InvitationInfoResponse;
}

export function InvitationContainer({ data }: InvitationContainerprops) {
  return (
    <S.InviteContainer fullScreen={true}>
      <S.PostItWrapper>
        <S.InviteMain>
          <S.IconWrapper>
            {/* 프로젝트 아이콘 ?? 로고 (로고 필요함)
            <S.IconCircle>
            </S.IconCircle> */}
          </S.IconWrapper>
          <S.MessageSection>
            <S.Title>프로젝트 초대</S.Title>
            <S.Description>
              <S.StrongText>{data?.ownerName}</S.StrongText>님의{' '}
              <S.StrongText>{data?.projectTitle}</S.StrongText> 프로젝트에 초대합니다.
              <br />
              {data?.memberCount}명의 멤버가 참여중입니다.
            </S.Description>
          </S.MessageSection>

          <S.ButtonGroup>
            <S.Button>참여하기</S.Button>
          </S.ButtonGroup>
        </S.InviteMain>

        <S.Shadow />
      </S.PostItWrapper>
    </S.InviteContainer>
  );
}
