import getAPIResponseData from "../utils/api-response";

export function withdraw(): Promise<void> {
  return getAPIResponseData<void>({
    url: `/api/auth/withdraw`,
    method: 'DELETE',
  });
}