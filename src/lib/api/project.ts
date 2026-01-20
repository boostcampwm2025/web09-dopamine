import getAPIResponseData from '@/lib/utils/api-response';
import { CreateProjectResponse, ProjectListItem } from '@/types/project';

export function getProjects() {
  return getAPIResponseData<Array<ProjectListItem>>({
    url: '/api/projects',
    method: 'GET',
  });
}

export function createProject(title: string) {
  return getAPIResponseData<CreateProjectResponse>({
    url: '/api/projects',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

export function deleteProject(id: string) {
  return getAPIResponseData<{ id: string }>({
    url: `/api/projects/${id}`,
    method: 'DELETE',
  });
}