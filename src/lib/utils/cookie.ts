import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const getCookieKey = (issueId: string) => `issue-user-id-${issueId}`;

const USER_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24,
};

export async function setUserIdCookie(issueId: string, userId: string) {
  const key = getCookieKey(issueId);
  const cookieStore = await cookies();

  cookieStore.set(key, userId, USER_COOKIE_OPTIONS);
}

/**
 * [API Route / Middleware용]
 * Request 객체에서 User ID를 추출
 */
export function getUserIdFromRequest(request: NextRequest, issueId: string): string | undefined {
  const key = getCookieKey(issueId);
  return request.cookies.get(key)?.value;
}

/**
 * [Server Component 용]
 * 서버 컴포넌트에서 User ID를 추출
 */
export async function getUserIdFromServer(issueId: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  const key = getCookieKey(issueId);
  return cookieStore.get(key)?.value;
}
