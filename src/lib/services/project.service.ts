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
