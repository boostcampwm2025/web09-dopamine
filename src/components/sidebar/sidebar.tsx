import type { InputHTMLAttributes, ReactNode } from 'react';
import * as S from './sidebar.styles';

interface SidebarProps {
  children: ReactNode;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

export default function Sidebar({ children, inputProps }: SidebarProps) {
  const inputId = inputProps?.id ?? 'sidebar';

  return (
    <S.Sidebar>
      <S.InputWrapper>
        <S.InputIcon
          src="/magnifier.svg"
          alt="돋보기 이미지"
          width={16}
          height={16}
        />
        <S.SidebarInput
          id={inputId}
          type="text"
          aria-label="Search"
          {...inputProps}
        />
      </S.InputWrapper>
      {children}
    </S.Sidebar>
  );
}
