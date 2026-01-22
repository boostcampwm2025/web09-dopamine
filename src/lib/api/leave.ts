import getAPIResponseData from '../utils/api-response';

export const leaveProject = async (projectId: string) => {
  return getAPIResponseData({
    url: `/api/project/${projectId}/leave`,
    method: 'DELETE',
  });
};
