import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import { createErrorResponse } from '@/lib/utils/api-helpers';
import { getUserIdFromServer } from './cookie';

export async function getAuthenticatedUserId(request?: Request | NextRequest) {
  const headerUserId = request ? getUserIdFromHeader(request) : null;

  if (headerUserId) {
    return {
      userId: headerUserId,
      error: null,
    };
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return {
      userId: null,
      error: createErrorResponse('UNAUTHORIZED', 401),
    };
  }

  return {
    userId: session.user.id,
    error: null,
  };
}

// Middleware에서 설정한 userId 추출
export function getUserIdFromHeader(request: Request | NextRequest): string | null {
  return request.headers.get('x-user-id') || null;
}

export async function getIssueUserId(issueId: string): Promise<string | null> {
  // 1. 쿠키에서 먼저 찾기 (비회원 최우선)
  const cookieUserId = await getUserIdFromServer(issueId);
  if (cookieUserId) return cookieUserId;

  // 2. 쿠키에 없으면 세션에서 찾기 (로그인 유저)
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}
