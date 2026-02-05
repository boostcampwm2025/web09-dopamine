import type { Metadata } from 'next';
import ProjectLayoutClient from './_components/project-layout-client';

export const metadata: Metadata = {
  title: 'Murphy',
  description: 'Murphy 프로젝트 관리 페이지',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProjectLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ProjectLayoutClient>{children}</ProjectLayoutClient>;
}
