// proxy.ts 미들웨어(NextAuth 토큰 → x-user-id 주입) 단위 테스트
// NextRequest 타입 사용
import { NextRequest } from 'next/server';
// getToken 모킹 대상
import { getToken } from 'next-auth/jwt';
// GET 요청 헬퍼
import { createMockGetRequest } from '@test/utils/api-test-helpers';
// 테스트 대상 함수
import { proxy } from '@/proxy';

// getToken을 모킹하여 토큰 존재 여부를 제어
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

describe('proxy', () => {
  // getToken 모킹 인스턴스 캐스팅
  const mockedGetToken = getToken as jest.MockedFunction<typeof getToken>;

  beforeEach(() => {
    // 모킹 상태 초기화
    jest.clearAllMocks();
    // 테스트용 시크릿 설정
    process.env.NEXTAUTH_SECRET = 'test-secret';
  });

  it('토큰이 없으면 401을 반환한다', async () => {
    // 토큰 없음으로 설정
    mockedGetToken.mockResolvedValue(null);

    // 요청 생성
    const req = createMockGetRequest();
    // proxy 실행
    const response = await proxy(req as NextRequest);

    // 401 응답 확인
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe('UNAUTHORIZED');
  });

  it('token.sub가 있으면 x-user-id를 주입한다', async () => {
    // sub 포함 토큰 설정
    mockedGetToken.mockResolvedValue({ sub: 'user-1' } as any);

    // 요청 생성
    const req = createMockGetRequest();
    // proxy 실행
    const response = await proxy(req as NextRequest);

    // 정상 응답 확인
    expect(response.status).toBe(200);
    // 미들웨어가 주입한 헤더 확인
    expect(response.headers.get('x-middleware-request-x-user-id')).toBe('user-1');
    // override 헤더 목록에 x-user-id 포함 여부 확인
    expect(response.headers.get('x-middleware-override-headers')).toContain('x-user-id');
  });

  it('token.sub가 없고 token.id가 있으면 id를 사용한다', async () => {
    // id만 있는 토큰 설정
    mockedGetToken.mockResolvedValue({ id: 'user-2' } as any);

    // 요청 생성
    const req = createMockGetRequest();
    // proxy 실행
    const response = await proxy(req as NextRequest);

    // 정상 응답 확인
    expect(response.status).toBe(200);
    // id가 헤더에 주입되는지 확인
    expect(response.headers.get('x-middleware-request-x-user-id')).toBe('user-2');
  });

  it('token에서 userId를 찾을 수 없으면 401을 반환한다', async () => {
    // 빈 토큰 설정
    mockedGetToken.mockResolvedValue({} as any);

    // 요청 생성
    const req = createMockGetRequest();
    // proxy 실행
    const response = await proxy(req as NextRequest);

    // 401 응답 확인
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe('UNAUTHORIZED');
  });
});
