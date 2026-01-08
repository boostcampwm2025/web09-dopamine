import * as S from './sidebar.styles';

//TODO: input에 이벤트 연결 필요
export default function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <S.Sidebar>
      <S.InputWrapper>
        <S.InputIcon
          src="/magnifier.svg"
          alt="돋보기 이미지"
          width={16}
          height={16}
        />
        <S.SrOnly htmlFor="sidebar">사이드바 입력창</S.SrOnly>
        <S.SidebarInput
          id="sidebar"
          type="text"
        />
      </S.InputWrapper>
      {children}
    </S.Sidebar>
  );
}
