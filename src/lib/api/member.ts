import getAPIResponseData from '@/lib/utils/api-response';

export function searchByNickname(issueId: string, nickname: string) {
  return getAPIResponseData<
    Array<{
      id: string;
      user: {
        id: string;
        displayName: string;
      };
    }>
  >({
    url: `/api/issues/${issueId}/members/${nickname}`,
    method: 'GET',
  });
}
