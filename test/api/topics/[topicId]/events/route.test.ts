import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/topics/[topicId]/events/route';
import { sseManager } from '@/lib/sse/sse-manager';

// 1. 모킹 설정
jest.mock('next-auth');
jest.mock('@/lib/sse/sse-manager');
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
// 라이브러리 충돌 방지용 (이전 에러 참고)
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({})),
}));

describe('GET /api/topics/[topicId]/events', () => {
  const topicId = 'topic-1';
  const userId = 'user-1';
  const mockStream = new ReadableStream();

  // Mock 함수 타입 캐스팅
  const mockedGetServerSession = getServerSession as jest.Mock;
  const mockedCreateTopicStream = sseManager.createTopicStream as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateTopicStream.mockReturnValue(mockStream);
  });

  const createRequest = () => {
    return new NextRequest(`http://localhost:3000/api/topics/${topicId}/events`);
  };

  // Next.js 15: params는 Promise 형태여야 함
  const mockParams = Promise.resolve({ topicId });

  it('로그인하지 않은 경우 401 에러를 반환한다', async () => {
    // Given: 세션 없음
    mockedGetServerSession.mockResolvedValue(null);

    const req = createRequest();

    // When
    const response = await GET(req, { params: mockParams });

    // Then
    expect(response.status).toBe(401);
    const data = await response.json();
    // createErrorResponse가 { error: { code: ... } } 형태라면 data.error.code 확인
    // { error: 'MESSAGE' } 형태라면 data.error 확인 (프로젝트 유틸 구현에 따름)
    // 여기서는 일반적인 createErrorResponse 패턴인 객체 내부 코드 확인으로 작성합니다.
    expect(data.error.code || data.error).toBe('USER_ID_REQUIRED');

    expect(mockedCreateTopicStream).not.toHaveBeenCalled();
  });

  it('로그인한 경우 SSE 스트림을 생성하고 올바른 헤더를 반환한다', async () => {
    // Given: 로그인 성공
    mockedGetServerSession.mockResolvedValue({ user: { id: userId } });

    const req = createRequest();

    // When
    const response = await GET(req, { params: mockParams });

    // Then
    expect(response.status).toBe(200);

    // 1. 헤더 검증
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');

    // 2. createTopicStream 호출 검증
    expect(mockedCreateTopicStream).toHaveBeenCalledWith({
      topicId,
      userId,
      signal: expect.anything(), // AbortSignal 객체 전달 확인
    });
  });
});
