import getAPIResponseData from '../utils/api-response';

export const leaveProject = async (projectId: string, memberId: string) => {
  return getAPIResponseData({
    url: `/api/projects/${projectId}/members/${memberId}`,
    method: 'DELETE',
  });
};
