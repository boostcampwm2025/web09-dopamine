import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserIdFromRequest } from '@/lib/utils/cookie';
import { NextRequest } from 'next/server';

export async function getAuthenticatedUserId(req: NextRequest, issueId?: string): Promise<string | null> {
  // 1. 세션 확인
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;

  // 2. 익명 사용자 확인 (쿠키 기반)
  if (issueId) {
    return getUserIdFromRequest(req, issueId) ?? null;
  }

  return null;
}
