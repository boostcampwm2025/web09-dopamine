import { getServerSession } from 'next-auth';
import {
  createMockParams,
  createMockRequest,
  createMockSession,
  expectErrorResponse,
  expectSuccessResponse,
  setupAuthMock,
} from '@test/utils/api-test-helpers';
import { POST } from '@/app/api/issues/[issueId]/ideas/[ideaId]/vote/route';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { voteService } from '@/lib/services/vote.service';
import { broadcast } from '@/lib/sse/sse-service';
import { getUserIdFromRequest } from '@/lib/utils/cookie';

// 1. 필요한 모듈 모킹
jest.mock('next-auth');
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: () => ({}),
}));
jest.mock('@/lib/services/vote.service');
jest.mock('@/lib/sse/sse-service');
jest.mock('@/lib/utils/cookie');

// Mock 함수 타입 캐스팅
const mockedCastVote = voteService.castVote as jest.MockedFunction<typeof voteService.castVote>;
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedBroadcast = broadcast as jest.Mock;
const mockedGetUserIdFromRequest = getUserIdFromRequest as jest.Mock;

describe('POST /api/issues/[issueId]/ideas/[ideaId]/vote', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('인증 및 유효성 검사', () => {
    it('로그인도 안 하고 쿠키도 없으면 400 에러를 반환한다', async () => {
      // Given: 세션 없음, 쿠키 ID 없음
      mockedGetServerSession.mockResolvedValue(null);
      mockedGetUserIdFromRequest.mockReturnValue(null);

      const req = createMockRequest({ voteType: 'AGREE' });
      const params = createMockParams({ issueId, ideaId });

      // When
      const response = await POST(req, params);

      // Then
      await expectErrorResponse(response, 400, 'INVALID_VOTE_REQUEST');
    });

    it('Body에 voteType이 없으면 400 에러를 반환한다', async () => {
      // Given: 로그인은 됨
      setupAuthMock(mockedGetServerSession, createMockSession('user-1'));

      const req = createMockRequest({}); // voteType 누락
      const params = createMockParams({ issueId, ideaId });

      const response = await POST(req, params);
      await expectErrorResponse(response, 400, 'INVALID_VOTE_REQUEST');
    });
  });

  describe('투표 로직', () => {
    it('로그인한 사용자(세션)가 투표하면 성공한다', async () => {
      // Given
      const userId = 'session-user-1';
      setupAuthMock(mockedGetServerSession, createMockSession(userId));
      mockedCastVote.mockResolvedValue({ agreeCount: 1, disagreeCount: 0 } as any);

      const req = createMockRequest({ voteType: 'AGREE' });
      const params = createMockParams({ issueId, ideaId });

      // When
      const response = await POST(req, params);

      // Then
      await expectSuccessResponse(response, 200);
      expect(mockedCastVote).toHaveBeenCalledWith(ideaId, userId, 'AGREE');
    });

    // 익명 사용자
    it('로그인하지 않았지만 쿠키에 ID가 있는 사용자(익명)가 투표하면 성공한다', async () => {
      // Given
      const anonUserId = 'anon-cookie-user';
      mockedGetServerSession.mockResolvedValue(null); // 세션 없음
      mockedGetUserIdFromRequest.mockReturnValue(anonUserId); // 쿠키 ID 있음
      mockedCastVote.mockResolvedValue({ agreeCount: 0, disagreeCount: 1 } as any);

      const req = createMockRequest({ voteType: 'DISAGREE' });
      const params = createMockParams({ issueId, ideaId });

      // When
      const response = await POST(req, params);

      // Then
      await expectSuccessResponse(response, 200);

      // 쿠키에서 가져온 ID로 서비스가 호출되었는지 확인
      expect(mockedCastVote).toHaveBeenCalledWith(ideaId, anonUserId, 'DISAGREE');
    });
  });

  describe('SSE 브로드캐스팅', () => {
    it('투표 성공 시 결과를 브로드캐스트 해야 한다 (excludeConnectionId 포함)', async () => {
      // Given
      setupAuthMock(mockedGetServerSession, createMockSession('user-1'));
      mockedCastVote.mockResolvedValue({ agreeCount: 10, disagreeCount: 5 } as any);

      // 헤더 설정 (본인에게는 알림이 오지 않도록 제외하기 위함)
      const connectionId = 'conn-123';
      const headers = {
        'x-sse-connection-id': connectionId,
      };

      const req = createMockRequest({ voteType: 'AGREE' }, { headers });
      const params = createMockParams({ issueId, ideaId });

      // When
      await POST(req, params);

      // Then
      expect(mockedBroadcast).toHaveBeenCalledWith({
        issueId,
        excludeConnectionId: connectionId, // 헤더 값 전달 확인
        event: {
          type: SSE_EVENT_TYPES.VOTE_CHANGED,
          data: {
            ideaId,
            agreeCount: 10,
            disagreeCount: 5,
          },
        },
      });
    });
  });

  describe('에러 처리', () => {
    it('서비스 로직에서 에러 발생 시 500 에러를 반환한다', async () => {
      setupAuthMock(mockedGetServerSession, createMockSession('user-1'));
      mockedCastVote.mockRejectedValue(new Error('DB Error'));

      const req = createMockRequest({ voteType: 'AGREE' });
      const params = createMockParams({ issueId, ideaId });

      const response = await POST(req, params);
      await expectErrorResponse(response, 500, 'VOTE_FAILED');
    });
  });
});
