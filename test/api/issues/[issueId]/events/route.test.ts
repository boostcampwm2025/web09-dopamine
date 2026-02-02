import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/issues/[issueId]/events/route';
import { sseManager } from '@/lib/sse/sse-manager';
import { getUserIdFromRequest } from '@/lib/utils/cookie';

// 1. 모킹 설정
jest.mock('next-auth');
jest.mock('@/lib/sse/sse-manager');
jest.mock('@/lib/utils/cookie');
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('GET /api/issues/[issueId]/events', () => {
  const issueId = 'issue-1';
  const mockStream = new ReadableStream();

  const mockedGetServerSession = getServerSession as jest.Mock;
  const mockedGetUserIdFromRequest = getUserIdFromRequest as jest.Mock;
  const mockedCreateStream = sseManager.createStream as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateStream.mockReturnValue(mockStream);
  });

  const createRequest = () => {
    return new NextRequest(`http://localhost:3000/api/issues/${issueId}/events`);
  };

  const mockParams = Promise.resolve({ issueId });

  it('유저 ID가 없으면(세션X, 쿠키X) 401 에러를 반환한다', async () => {
    mockedGetServerSession.mockResolvedValue(null);
    mockedGetUserIdFromRequest.mockReturnValue(null);

    const req = createRequest();

    // 호출 시 { params: Promise } 형태 준수
    const response = await GET(req, { params: mockParams });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe('USER_ID_REQUIRED');
  });

  it('쿠키에 유저 ID가 있으면(익명 참여) 해당 ID로 스트림을 생성한다', async () => {
    const cookieUserId = 'anon-user-1';
    mockedGetServerSession.mockResolvedValue(null);
    mockedGetUserIdFromRequest.mockReturnValue(cookieUserId);

    const req = createRequest();

    const response = await GET(req, { params: mockParams });

    expect(response.status).toBe(200);
    expect(mockedCreateStream).toHaveBeenCalledWith({
      issueId,
      userId: cookieUserId,
      signal: expect.anything(),
    });
  });

  it('세션에 유저 ID가 있고 쿠키가 없으면 세션 ID로 스트림을 생성한다', async () => {
    const sessionUserId = 'session-user-1';
    mockedGetServerSession.mockResolvedValue({ user: { id: sessionUserId } });
    mockedGetUserIdFromRequest.mockReturnValue(null);

    const req = createRequest();

    const response = await GET(req, { params: mockParams });

    expect(response.status).toBe(200);
    expect(mockedCreateStream).toHaveBeenCalledWith({
      issueId,
      userId: sessionUserId,
      signal: expect.anything(),
    });
  });

  it('쿠키와 세션이 둘 다 있으면 쿠키 ID(익명 참여)를 우선한다', async () => {
    const cookieUserId = 'anon-user-1';
    const sessionUserId = 'session-user-1';

    mockedGetServerSession.mockResolvedValue({ user: { id: sessionUserId } });
    mockedGetUserIdFromRequest.mockReturnValue(cookieUserId);

    const req = createRequest();

    await GET(req, { params: mockParams });

    expect(mockedCreateStream).toHaveBeenCalledWith(
      expect.objectContaining({ userId: cookieUserId }),
    );
  });

  it('올바른 SSE 헤더를 반환한다', async () => {
    mockedGetUserIdFromRequest.mockReturnValue('user-1');

    const req = createRequest();

    const response = await GET(req, { params: mockParams });

    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');
  });
});
