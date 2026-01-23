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
