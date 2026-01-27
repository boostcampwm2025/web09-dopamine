// API 인증 유틸(getAuthenticatedUserId/getUserIdFromHeader) 단위 테스트
// 테스트에서 사용할 요청 생성 헬퍼
import { createMockRequest } from '@test/utils/api-test-helpers';

// next-auth의 getServerSession을 모킹하여 세션 유무를 제어
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// authOptions 의존성을 제거하기 위한 모킹
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('api-auth', () => {
  beforeEach(() => {
    // 테스트 간 모킹 상태 초기화
    jest.clearAllMocks();
  });

  it('getUserIdFromHeader는 x-user-id를 반환한다', async () => {
    // 테스트 대상 함수 로드
    const { getUserIdFromHeader } = await import('@/lib/utils/api-auth');

    // x-user-id 헤더가 있는 요청 생성
    const req = createMockRequest(undefined, {
      headers: { 'x-user-id': 'user-1' },
      method: 'GET',
    });

    // 헤더 값이 그대로 반환되는지 확인
    expect(getUserIdFromHeader(req)).toBe('user-1');
  });

  it('getUserIdFromHeader는 없으면 null을 반환한다', async () => {
    // 테스트 대상 함수 로드
    const { getUserIdFromHeader } = await import('@/lib/utils/api-auth');

    // 헤더 없는 요청 생성
    const req = createMockRequest(undefined, { method: 'GET' });

    // 헤더가 없으므로 null 반환 확인
    expect(getUserIdFromHeader(req)).toBeNull();
  });

  it('getAuthenticatedUserId는 세션이 없으면 UNAUTHORIZED를 반환한다', async () => {
    // 테스트 대상 함수 로드
    const { getAuthenticatedUserId } = await import('@/lib/utils/api-auth');
    // 모킹된 getServerSession 획득
    const { getServerSession } = await import('next-auth');

    // 세션 없음으로 설정
    (getServerSession as jest.Mock).mockResolvedValue(null);

    // 실행
    const result = await getAuthenticatedUserId();

    // userId가 null인지 확인
    expect(result.userId).toBeNull();
    // 에러 객체 존재 확인
    expect(result.error).toBeDefined();
    // 401 상태 확인
    expect(result.error!.status).toBe(401);

    // 에러 코드 확인
    const body = await result.error!.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('getAuthenticatedUserId는 세션이 있으면 userId를 반환한다', async () => {
    // 테스트 대상 함수 로드
    const { getAuthenticatedUserId } = await import('@/lib/utils/api-auth');
    // 모킹된 getServerSession 획득
    const { getServerSession } = await import('next-auth');

    // 세션이 있는 경우로 설정
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });

    // 실행
    const result = await getAuthenticatedUserId();

    // userId가 반환되는지 확인
    expect(result.userId).toBe('user-1');
    // 에러가 없는지 확인
    expect(result.error).toBeNull();
  });
});
