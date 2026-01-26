import getAPIResponseData from '../utils/api-response';

export type Topic = {
  id: string;
  title: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

export function getTopic(topicId: string): Promise<Topic> {
  return getAPIResponseData<Topic>({
    url: `/api/topics/${topicId}`,
    method: 'GET',
  });
}

export interface CreateTopicData {
  title: string;
  projectId: string;
}

export function createTopic(title: string, projectId: string) {
  return getAPIResponseData<{ id: string; title: string }>({
    url: '/api/topics',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, projectId }),
  });
}
