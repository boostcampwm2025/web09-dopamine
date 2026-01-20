import getAPIResponseData from '@/lib/utils/api-response';

export function getProjects() {
  return getAPIResponseData<
    Array<{
      id: string;
      title: string;
      description: string | null;
      memberCount: number;
      createdAt: string;
      updatedAt: string;
    }>
  >({
    url: '/api/projects',
    method: 'GET',
  });
}

export function createProject(title: string) {
  return getAPIResponseData<{
    id: string;
    title: string;
    ownerId: string;
    createdAt: string;
  }>({
    url: '/api/projects',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}
