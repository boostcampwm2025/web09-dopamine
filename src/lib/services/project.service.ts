import * as projectRepository from '@/lib/repositories/project.repository';
import type { ProjectListItem } from '@/types/project';

export async function getProjectListForUser(userId: string): Promise<ProjectListItem[]> {
  const projects = await projectRepository.getProjectsByUserMembership(userId);

  return projects.map((project) => ({
    ...project,
    createdAt: new Date(project.createdAt).toISOString(),
    updatedAt: new Date(project.updatedAt).toISOString(),
  }));
}

export async function checkProjectAccess(projectId: string, userId: string): Promise<void> {
  const projectData = await projectRepository.getProjectWithTopics(projectId);

  if (!projectData) {
    throw new Error('PROJECT_NOT_FOUND');
  }

  const isMember = await projectRepository.isProjectMember(projectId, userId);
  if (!isMember) {
    throw new Error('FORBIDDEN');
  }
}

/**
 * 프로젝트 데이터 조회 (권한 확인 포함)
 */
export async function getProjectWithTopicsForUser(projectId: string, userId: string) {
  await checkProjectAccess(projectId, userId);
  return projectRepository.getProjectWithTopics(projectId);
}
