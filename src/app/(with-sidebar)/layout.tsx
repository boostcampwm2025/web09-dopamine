import type { Metadata } from 'next';
import WithSidebarClient from './_components/with-sidebar-client';

export const metadata: Metadata = {
  title: 'Murphy',
  description: 'Murphy 협업 공간',
  robots: {
    index: false,
    follow: false,
  },
};

export default function WithSidebarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WithSidebarClient>{children}</WithSidebarClient>;
}
