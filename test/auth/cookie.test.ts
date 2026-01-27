// 이슈 쿠키 유틸(set/get) 단위 테스트
// next/headers의 cookies 함수 모킹 대상
import { cookies } from 'next/headers';

// cookies() 호출을 모킹
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('cookie utils', () => {
  // 모킹된 cookies 함수 캐스팅
  const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;

  beforeEach(() => {
    // 모킹 상태 초기화
    jest.clearAllMocks();
  });

  it('setUserIdCookie는 issue-user-id 쿠키를 설정한다', async () => {
    // 테스트 대상 함수 로드
    const { setUserIdCookie } = await import('@/lib/utils/cookie');
    // 쿠키 스토어 모킹
    const cookieStore = { set: jest.fn() } as any;

    // cookies()가 스토어를 반환하도록 설정
    mockedCookies.mockResolvedValue(cookieStore);

    // 쿠키 설정 실행
    await setUserIdCookie('issue-1', 'user-1');

    // set 호출 인자 검증
    expect(cookieStore.set).toHaveBeenCalledWith(
      'issue-user-id-issue-1',
      'user-1',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV === 'production',
      }),
    );
  });

  it('getUserIdFromRequest는 요청 쿠키에서 값을 반환한다', async () => {
    // 테스트 대상 함수 로드
    const { getUserIdFromRequest } = await import('@/lib/utils/cookie');

    // 요청 객체에 쿠키 getter 모킹
    const req = {
      cookies: {
        get: jest.fn().mockReturnValue({ value: 'user-1' }),
      },
    } as any;

    // 반환값 검증
    expect(getUserIdFromRequest(req, 'issue-1')).toBe('user-1');
    // 특정 키로 쿠키 조회했는지 확인
    expect(req.cookies.get).toHaveBeenCalledWith('issue-user-id-issue-1');
  });

  it('getUserIdFromServer는 서버 쿠키에서 값을 반환한다', async () => {
    // 테스트 대상 함수 로드
    const { getUserIdFromServer } = await import('@/lib/utils/cookie');
    // 쿠키 스토어 모킹
    const cookieStore = {
      get: jest.fn().mockReturnValue({ value: 'user-2' }),
    } as any;

    // cookies()가 스토어를 반환하도록 설정
    mockedCookies.mockResolvedValue(cookieStore);

    // 서버에서 쿠키 조회 실행
    const result = await getUserIdFromServer('issue-1');

    // 조회 키 확인
    expect(cookieStore.get).toHaveBeenCalledWith('issue-user-id-issue-1');
    // 반환값 확인
    expect(result).toBe('user-2');
  });
});
