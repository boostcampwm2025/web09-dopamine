import { User } from "next-auth";
import getAPIResponseData from "../utils/api-response";

export function withdraw(): Promise<void> {
  return getAPIResponseData<void>({
    url: `/api/auth/withdraw`,
    method: 'DELETE',
  });
}

export function updateDisplayName(displayName: string): Promise<User & { displayName?: string }> {
  return getAPIResponseData<User & { displayName?: string }>({
    url: `/api/users/me`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName }),
  });
}
