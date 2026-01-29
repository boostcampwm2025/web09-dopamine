import type { InputHTMLAttributes, ReactNode } from 'react';
import * as S from './sidebar.styles';

interface SidebarProps {
  children: ReactNode;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  suffix?: ReactNode;
}

export default function Sidebar({ children, inputProps, suffix }: SidebarProps) {
  const inputId = inputProps?.id ?? 'sidebar';

  return (
    <S.Sidebar>
      <S.InputWrapper>
        <S.SearchBox>
          <S.InputIcon
            src="/magnifier.svg"
            alt="돋보기 이미지"
            width={16}
            height={16}
          />
          <S.SrOnly htmlFor={inputId}>Search</S.SrOnly>
          <S.SidebarInput
            id={inputId}
            type="text"
            {...inputProps}
          />
        </S.SearchBox>
        {suffix}
      </S.InputWrapper>
      {children}
    </S.Sidebar>
  );
}
