import getAPIResponseData from '@/lib/utils/api-response';
import { CreateProjectResponse, ProjectListItem } from '@/types/project';

export function getProjects() {
  return getAPIResponseData<Array<ProjectListItem>>({
    url: '/api/projects',
    method: 'GET',
  });
}

export function createProject(title: string, description?: string) {
  return getAPIResponseData<CreateProjectResponse>({
    url: '/api/projects',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
}

export function deleteProject(id: string) {
  return getAPIResponseData<{ id: string }>({
    url: '/api/projects',
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
}

export function updateProject(id: string, title: string, description?: string) {
  return getAPIResponseData<{ id: string }>({
    url: `/api/projects/${id}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, description }),
  });
}
