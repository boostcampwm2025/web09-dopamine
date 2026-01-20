'use client';

import styled from '@emotion/styled';
import { ProjectCard } from '../_components/project-card/project-card';

const Container = styled.div`
  width: 100%;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`;

const mockProjects = [
  { id: 1, title: 'Murphy 서비스 런칭', icon: '📚', memberCount: 3 },
  { id: 2, title: '디자인 시스템 개편', memberCount: 3 },
  { id: 3, title: 'AI 챗봇 개발', memberCount: 5 },
];

export default function Page() {
  return (
    <Container>
      <CardGrid>
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
        <ProjectCard isCreateCard />
      </CardGrid>
    </Container>
  );
}