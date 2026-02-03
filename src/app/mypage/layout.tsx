import type { Metadata } from 'next';
import MypageLayoutClient from './_components/mypage-layout-client';

export const metadata: Metadata = {
  title: 'Murphy',
  description: 'Murphy 마이페이지',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MypageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <MypageLayoutClient>{children}</MypageLayoutClient>;
}
