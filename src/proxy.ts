import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  // matcher에서 필요한 API만 걸러서 실행됨
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = getUserId(token);

  if (!userId) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', userId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function getUserId(token: unknown): string | null {
  if (!token || typeof token !== 'object') return null;

  const { sub, id } = token as Record<string, unknown>;

  if (typeof sub === 'string') return sub;
  if (typeof id === 'string') return id;

  return null;
}

export const config = {
  matcher: ['/api/projects', '/api/projects/:path*', '/api/topics', '/api/topics/:path*'],
};
