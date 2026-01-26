import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // matcher에서 필요한 API만 걸러서 실행됨
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId =
    typeof token.sub === 'string'
      ? token.sub
      : typeof (token as { id?: unknown }).id === 'string'
        ? (token as { id: string }).id
        : null;

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

export const config = {
  matcher: ['/api/projects/:path*', '/api/topics/:path*'],
};
