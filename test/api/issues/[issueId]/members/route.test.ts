import { getServerSession } from 'next-auth';
import { IssueRole, Prisma } from '@prisma/client';
import { GET, POST } from '@/app/api/issues/[issueId]/members/route';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
import {
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  createMockSession,
  expectErrorResponse,
  expectSuccessResponse,
  setupAuthMock,
} from '@test/utils/api-test-helpers';
import { GET, POST } from '@/app/api/issues/[issueId]/members/route';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { prisma } from '@/lib/prisma';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { createAnonymousUser } from '@/lib/repositories/user.repository';
import { issueMemberService } from '@/lib/services/issue-member.service';
import { broadcast } from '@/lib/sse/sse-service';

jest.mock('next-auth');
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
jest.mock('@/lib/repositories/issue.repository');
jest.mock('@/lib/repositories/issue-member.repository');
jest.mock('@/lib/repositories/user.repository');
jest.mock('@/lib/utils/cookie');
jest.mock('@/lib/sse/sse-service');

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedFindIssueById = findIssueById as jest.MockedFunction<typeof findIssueById>;
const mockedFindMembersByIssueId =
  issueMemberRepository.findMembersByIssueId as jest.MockedFunction<
    typeof issueMemberRepository.findMembersByIssueId
  >;
const mockedFindMemberByUserId = issueMemberRepository.findMemberByUserId as jest.MockedFunction<
  typeof issueMemberRepository.findMemberByUserId
>;
const mockedAddIssueMember = issueMemberRepository.addIssueMember as jest.MockedFunction<
  typeof issueMemberRepository.addIssueMember
>;
const mockedCheckNicknameDuplicate =
  issueMemberService.checkNicknameDuplicate as jest.MockedFunction<
    typeof issueMemberService.checkNicknameDuplicate
  >;
const mockedCreateAnonymousUser = createAnonymousUser as jest.MockedFunction<
  typeof createAnonymousUser
const mockedJoinLoggedInMember = issueMemberRepository.joinLoggedInMember as jest.MockedFunction<
  typeof issueMemberRepository.joinLoggedInMember
>;
const mockedJoinAnonymousMember = issueMemberRepository.joinAnonymousMember as jest.MockedFunction<
  typeof issueMemberRepository.joinAnonymousMember
>;
const mockedBroadcast = broadcast as jest.Mock;

describe('GET /api/issues/[issueId]/members', () => {
  const issueId = 'issue-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('nickname 파라미터가 있으면 중복 여부(false)를 확인하고 반환한다', async () => {
    // Given
    const nickname = 'TestUser';
    mockedCheckNicknameDuplicate.mockResolvedValue(false);

    const req = createMockGetRequest({ url: `http://localhost:3000?nickname=${nickname}` });
    const params = createMockParams({ issueId });

    // When
    const response = await GET(req, params);

    // Then
    const data = await expectSuccessResponse(response, 200);
    expect(data.isDuplicate).toBe(false);
    expect(mockedCheckNicknameDuplicate).toHaveBeenCalledWith(issueId, nickname);
  });

  it('성공적으로 멤버 목록을 조회한다', async () => {
    // Given
    const mockMembers = [
      { userId: 'user-1', role: IssueRole.OWNER, nickname: 'User 1' },
      { userId: 'user-2', role: IssueRole.MEMBER, nickname: 'User 2' },
    ];
    mockedFindMembersByIssueId.mockResolvedValue(mockMembers as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId });

    // When
    const response = await GET(req, params);

    // Then
    const data = await expectSuccessResponse(response, 200);
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe('user-1');
  });

  it('조회된 멤버가 없으면 404 에러를 반환한다', async () => {
    // Given
    mockedFindMembersByIssueId.mockResolvedValue(null as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId });

    // When
    const response = await GET(req, params);

    // Then
    await expectErrorResponse(response, 404, 'MEMBERS_NOT_FOUND');
  });

  it('DB 조회 중 에러가 발생하면 500 에러를 반환한다', async () => {
    // Given
    mockedFindMembersByIssueId.mockRejectedValue(new Error('DB Connection Error'));

    const req = createMockGetRequest();
    const params = createMockParams({ issueId });

    // When
    const response = await GET(req, params);

    // Then
    await expectErrorResponse(response, 500, 'MEMBERS_FETCH_FAILED');
  });
});

describe('POST /api/issues/[issueId]/members', () => {
  const issueId = 'issue-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('존재하지 않는 이슈 ID로 요청하면 404 에러를 반환한다', async () => {
    // Given
    mockedFindIssueById.mockResolvedValue(null);

    const req = createMockRequest({ nickname: 'New User' });
    const params = createMockParams({ issueId });

    // When
    const response = await POST(req, params);

    // Then
    await expectErrorResponse(response, 404, 'ISSUE_NOT_FOUND');
  });

  it('토픽 이슈에서 로그인 사용자가 "이미 참여한 경우" 기존 userId를 반환한다', async () => {
    // Given
    const mockIssue = { title: 'Topic Issue', topicId: 'topic-1' };
    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    setupAuthMock(mockedGetServerSession, createMockSession(userId));
    mockedJoinLoggedInMember.mockResolvedValue({ userId, didJoin: false });

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    // When
    const response = await POST(req, params);

    // Then
    const data = await expectSuccessResponse(response, 201);
    expect(data.userId).toBe(userId);
    // 추가 로직(트랜잭션 등)은 호출되지 않아야 함
    expect(mockedPrismaTransaction).not.toHaveBeenCalled();
  });

  it('토픽 이슈에서 로그인 사용자가 "새로 참여"하면 DB에 추가하고 브로드캐스트한다', async () => {
    // Given
    const mockIssue = { title: 'Topic Issue', topicId: 'topic-1' };
    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    setupAuthMock(mockedGetServerSession, createMockSession(userId));
    mockedFindMemberByUserId.mockResolvedValue(null); // 아직 참여 안 함

    // 트랜잭션 성공 시뮬레이션
    mockedPrismaTransaction.mockImplementation(async (callback: any) => {
      await mockedAddIssueMember.mockResolvedValue({} as any);
      return callback({});
    });
    
    mockedJoinLoggedInMember.mockResolvedValue({ userId, didJoin: true });

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    // When
    const response = await POST(req, params);

    // Then
    const data = await expectSuccessResponse(response, 201);
    expect(data.userId).toBe(userId);

    // SSE 알림 전송 확인
    expect(mockedBroadcast).toHaveBeenCalledWith({
      issueId,
      excludeConnectionId: undefined,
      event: {
        type: SSE_EVENT_TYPES.MEMBER_JOINED,
        data: {},
      },
    });
  });

  it('빠른 이슈(익명)에서 nickname을 안 보내면 400 에러를 반환한다', async () => {
    // Given
    const mockIssue = { title: 'Quick Issue', topicId: null };
    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    setupAuthMock(mockedGetServerSession, null); // 비로그인

    const req = createMockRequest({}); // nickname 누락
    const params = createMockParams({ issueId });

    // When
    const response = await POST(req, params);

    // Then
    await expectErrorResponse(response, 400, 'NICKNAME_REQUIRED');
  });

  it('빠른 이슈에서 익명 사용자가 참여한다', async () => {
    const mockIssue = { title: 'Test Issue', topicId: null, status: 'SELECT', projectId: null };
    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    setupAuthMock(mockedGetServerSession, null);
    mockedJoinAnonymousMember.mockResolvedValue({ userId: 'anonymous-user-1', didJoin: true });

    const req = createMockRequest({ nickname: 'Anon' });
    const params = createMockParams({ issueId });

    // When
    const response = await POST(req, params);

    // Then
    const data = await expectSuccessResponse(response, 201);
    expect(data.userId).toBe(mockUser.id);
    expect(mockedBroadcast).toHaveBeenCalled();
  });

  it('그 외 알 수 없는 에러가 발생하면 500 에러를 반환한다', async () => {
    // Given
    mockedFindIssueById.mockRejectedValue(new Error('Unknown Fatal Error'));

    const req = createMockRequest({ nickname: 'User' });
    const params = createMockParams({ issueId });

    // When
    const response = await POST(req, params);

    // Then
    await expectErrorResponse(response, 500, 'MEMBER_JOIN_FAILED');
  });
});
