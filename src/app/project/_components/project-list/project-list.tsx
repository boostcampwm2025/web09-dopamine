'use client';

import { signOut } from 'next-auth/react';
import { ProjectCard } from '@/app/project/_components/project-card/project-card';
import { useProjectsQuery } from '@/hooks/project';
import { ApiError } from '@/lib/utils/api-response';
import * as S from './project-list.styles';

export function ProjectList() {
  const { data: projects, isLoading, isError, error } = useProjectsQuery();

  // 401 에러 시 자동 로그아웃
  if (isError) {
    if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
      signOut({ callbackUrl: '/' });
      return null;
    }
    return <div>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <S.Container>
      <S.CardGrid>
        {projects?.map((project) => (
          <ProjectCard
            key={project.id}
            {...project}
          />
        ))}
        <ProjectCard isCreateCard />
      </S.CardGrid>
    </S.Container>
  );
}
