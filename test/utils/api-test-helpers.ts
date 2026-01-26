import { NextRequest } from 'next/server';
import type { Session } from 'next-auth';

/**
 * API 테스트를 위한 공통 헬퍼 함수들
 */

/**
 * Mock NextRequest 생성
 * @param body - 요청 body (JSON)
 * @param options - 추가 옵션 (headers, method 등)
 */
export function createMockRequest(
  body?: any,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    url?: string;
  },
): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
    method: options?.method || 'POST',
    headers: new Headers(options?.headers || {}),
    url: options?.url || 'http://localhost:3000',
  } as unknown as NextRequest;
}

/**
 * Mock NextRequest (GET 요청용 - body 없음)
 */
export function createMockGetRequest(options?: {
  headers?: Record<string, string>;
  url?: string;
}): NextRequest {
  return {
    method: 'GET',
    headers: new Headers(options?.headers || {}),
    url: options?.url || 'http://localhost:3000',
  } as unknown as NextRequest;
}

/**
 * Mock Params 생성 (Next.js 동적 라우트 파라미터)
 * @param params - 동적 라우트 파라미터 객체
 * @example createMockParams({ issueId: 'issue-1' })
 * @example createMockParams({ issueId: 'issue-1', ideaId: 'idea-1' })
 */
export function createMockParams<T extends Record<string, string>>(
  params: T,
): { params: Promise<T> } {
  return {
    params: Promise.resolve(params),
  };
}

/**
 * Mock Session 생성 (인증된 사용자)
 * @param userId - 사용자 ID
 * @param additionalData - 추가 세션 데이터 (user.id는 제외)
 */
export function createMockSession(
  userId: string,
  additionalData?: Omit<Partial<Session>, 'user'> & {
    user?: Omit<Partial<Session['user']>, 'id'>;
  },
): Session {
  const userData = additionalData?.user;
  
  return {
    ...additionalData,
    user: {
      id: userId, // id는 항상 userId로 유지 (덮어쓰기 방지)
      name: userData?.name || 'Test User',
      email: userData?.email !== undefined ? userData.email : 'test@example.com',
      image: userData?.image || null,
    },
    expires: additionalData?.expires || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  } as Session;
}

/**
 * Mock Session 생성 (인증되지 않은 사용자)
 */
export function createUnauthenticatedSession(): null {
  return null;
}

/**
 * getServerSession 모킹 설정 헬퍼
 * @param getServerSessionMock - jest.fn()으로 생성한 mock 함수
 * @param session - 반환할 세션 (null이면 인증되지 않은 사용자)
 */
export function setupAuthMock(
  getServerSessionMock: jest.MockedFunction<any>,
  session: Session | null,
) {
  getServerSessionMock.mockResolvedValue(session);
}

/**
 * 에러 응답 검증 헬퍼
 * @param response - NextResponse
 * @param expectedStatus - 예상 HTTP 상태 코드
 * @param expectedErrorCode - 예상 에러 코드
 */
export async function expectErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedErrorCode?: string,
) {
  const data = await response.json();

  expect(response.status).toBe(expectedStatus);
  expect(data.success).toBe(false);
  expect(data.data).toBeNull();
  expect(data.error).toBeDefined();

  if (expectedErrorCode) {
    expect(data.error.code).toBe(expectedErrorCode);
  }

  return data;
}

/**
 * 성공 응답 검증 헬퍼
 * @param response - NextResponse
 * @param expectedStatus - 예상 HTTP 상태 코드 (기본값: 200)
 * @param validator - 데이터 검증 함수 (선택)
 */
export async function expectSuccessResponse<T = any>(
  response: Response,
  expectedStatus: number = 200,
  validator?: (data: T) => void,
): Promise<T> {
  const data = await response.json();

  expect(response.status).toBe(expectedStatus);
  expect(data.success).toBe(true);
  expect(data.error).toBeNull();
  expect(data.data).toBeDefined();

  if (validator) {
    validator(data.data);
  }

  return data.data;
}

/**
 * 인증되지 않은 사용자 테스트 헬퍼
 * @param handler - API 핸들러 함수
 * @param getServerSessionMock - getServerSession mock 함수
 * @param params - 동적 라우트 파라미터
 * @param request - NextRequest (선택)
 */
export async function testUnauthenticatedAccess(
  handler: (req: NextRequest, context: any) => Promise<Response>,
  getServerSessionMock: jest.MockedFunction<any>,
  params: { params: Promise<any> },
  request?: NextRequest,
) {
  setupAuthMock(getServerSessionMock, null);

  const req = request || createMockGetRequest();
  const response = await handler(req, params);

  await expectErrorResponse(response, 401, 'UNAUTHORIZED');
}

/**
 * Prisma Transaction Mock 헬퍼
 * @param mockTransaction - prisma.$transaction mock 함수
 * @param callback - 트랜잭션 콜백 함수를 실행할 mock 구현
 */
export function setupPrismaTransactionMock(
  mockTransaction: jest.MockedFunction<any>,
  callback?: (mockTx: any) => any,
) {
  mockTransaction.mockImplementation(async (fn: (tx: any) => any) => {
    const mockTx = callback ? callback({}) : {};
    return fn(mockTx);
  });
}
