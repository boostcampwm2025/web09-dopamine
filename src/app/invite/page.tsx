import * as S from './pags.styles';

export default function Page() {
  return (
    <S.InviteContainer fullScreen={true}>
      <S.PostItWrapper>
        <S.InviteMain>
          <S.IconWrapper>
            <S.IconCircle></S.IconCircle>
          </S.IconWrapper>
          <S.MessageSection>
            <S.Title>프로젝트 초대</S.Title>
            <S.Description>
              유저님이 프로젝트에 초대했습니다.
              <br />
              3명의 멤버가 참여중입니다.
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

// <Container>
//   <h2>프로젝트 참여하기</h2>
//   <span>프로젝트 이미지</span>
//   <span>프로젝트 이름</span>
//   <span>프로젝트 주인</span>
//   <span>프로젝트 참여자 리스트</span>
//   <button>참여하기</button>
// </Container>
