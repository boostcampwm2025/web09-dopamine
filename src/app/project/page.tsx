'use client';

import styled from '@emotion/styled';
import { signOut } from 'next-auth/react';
import { ProjectCard } from '@/app/project/_components/project-card/project-card';
import { useProjectsQuery } from '@/app/project/hooks/use-project-query';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`;

export default function Page() {
  const { data: projects, isLoading, isError } = useProjectsQuery();

  // 인증 에러 등으로 데이터 페칭 실패 시 자동 로그아웃
  if (isError) {
    signOut({ callbackUrl: '/' });
    return null; 
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <CardGrid>
        {projects?.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
        <ProjectCard isCreateCard />
      </CardGrid>
    </Container>
  );
}