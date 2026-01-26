import { NextRequest, NextResponse } from 'next/server';
import { refreshSession, verifyAccessToken } from '@/lib/auth/session-manager';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 라우트만 처리
  // if (!pathname.startsWith('/api/')) {
  //   return NextResponse.next();
  // }

  // 루트 경로라면 차단 안함
  if (pathname === '/') {
    return NextResponse.next();
  }

  // NextAuth 엔드포인트는 건너뛰기
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // 익명 사용자 처리 (빠른 이슈)
  // issue-user-id-{issueId} 쿠키가 있으면 통과
  const cookies = request.cookies.getAll();

  // 이슈 페이지랑 SSE 엔드포인트는 건너뛰기
  if (
    pathname.includes('/issues/') &&
    pathname.includes('/events') &&
    pathname.includes('api/issues/')
  ) {
    return NextResponse.next();
  }

  // 1. Access Token 확인
  const accessToken = request.cookies.get('access_token')?.value;

  if (accessToken) {
    const session = await verifyAccessToken(accessToken);

    if (session) {
      // userId를 헤더에 추가
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', session.userId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  // 2. Access Token 만료 → Refresh Token으로 갱신
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    // RTR 실행
    const newTokens = await refreshSession(refreshToken);

    // userId를 헤더에 추가
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', newTokens.userId);

    // 응답에 새 쿠키 설정
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.cookies.set('access_token', newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600, // 1시간
    });

    response.cookies.set('refresh_token', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api',
      maxAge: 1209600, // 14일
    });

    return response;
  } catch (error) {
    // Refresh Token도 만료
    console.error('리프레스 토큰이 만료된 계정:', error);
    return NextResponse.json({ message: 'SESSION_EXPIRED' }, { status: 401 });
  }
}

export const config = {
  matcher: '/:path*',
};
