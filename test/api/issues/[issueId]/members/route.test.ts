import { getServerSession } from 'next-auth';
import { GET, POST } from '@/app/api/issues/[issueId]/members/route';
import { IssueRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { createAnonymousUser } from '@/lib/repositories/user.repository';
import { issueMemberService } from '@/lib/services/issue-member.service';
import {
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  createMockSession,
  setupAuthMock,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
jest.mock('@/lib/repositories/issue.repository');
jest.mock('@/lib/repositories/issue-member.repository');
jest.mock('@/lib/repositories/user.repository');
jest.mock('@/lib/services/issue-member.service');
jest.mock('@/lib/utils/cookie');
jest.mock('@/lib/sse/sse-service');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedFindIssueById = findIssueById as jest.MockedFunction<typeof findIssueById>;
const mockedFindMembersByIssueId = issueMemberRepository.findMembersByIssueId as jest.MockedFunction<
  typeof issueMemberRepository.findMembersByIssueId
>;
const mockedFindMemberByUserId = issueMemberRepository.findMemberByUserId as jest.MockedFunction<
  typeof issueMemberRepository.findMemberByUserId
>;
const mockedAddIssueMember = issueMemberRepository.addIssueMember as jest.MockedFunction<
  typeof issueMemberRepository.addIssueMember
>;
const mockedCheckNicknameDuplicate = issueMemberService.checkNicknameDuplicate as jest.MockedFunction<
  typeof issueMemberService.checkNicknameDuplicate
>;
const mockedCreateAnonymousUser = createAnonymousUser as jest.MockedFunction<
  typeof createAnonymousUser
>;
const mockedPrismaTransaction = prisma.$transaction as jest.MockedFunction<
  typeof prisma.$transaction
>;

describe('GET /api/issues/[issueId]/members', () => {
  const issueId = 'issue-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('nickname 파라미터가 있으면 중복 여부를 확인한다', async () => {
    const nickname = 'TestUser';
    mockedCheckNicknameDuplicate.mockResolvedValue(false);

    const req = createMockGetRequest({ url: `http://localhost:3000?nickname=${nickname}` });
    const params = createMockParams({ issueId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.isDuplicate).toBe(false);
    expect(mockedCheckNicknameDuplicate).toHaveBeenCalledWith(issueId, nickname);
  });

  it('성공적으로 멤버 목록을 조회한다', async () => {
    const mockMembers = [
      {
        userId: 'user-1',
        role: IssueRole.OWNER,
        nickname: 'User 1',
      },
      {
        userId: 'user-2',
        role: IssueRole.MEMBER,
        nickname: 'User 2',
      },
    ];

    mockedFindMembersByIssueId.mockResolvedValue(mockMembers as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data).toHaveLength(2);
    expect(data[0].id).toBe('user-1');
    expect(data[0].nickname).toBe('User 1');
    expect(data[0].role).toBe(IssueRole.OWNER);
  });

  it('멤버가 없으면 404 에러를 반환한다', async () => {
    mockedFindMembersByIssueId.mockResolvedValue(null);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 404, 'MEMBERS_NOT_FOUND');
  });
});

describe('POST /api/issues/[issueId]/members', () => {
  const issueId = 'issue-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('존재하지 않는 이슈에 참여하면 404 에러를 반환한다', async () => {
    mockedFindIssueById.mockResolvedValue(null);

    const req = createMockRequest({ nickname: 'Test User' });
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 404, 'ISSUE_NOT_FOUND');
  });

  it('토픽 이슈에서 로그인 사용자가 이미 참여한 경우 기존 userId를 반환한다', async () => {
    const mockIssue = { title: 'Test Issue', topicId: 'topic-1', status: 'SELECT', projectId: null };
    const mockMember = {
      userId,
      role: IssueRole.MEMBER,
      nickname: 'Test User',
    };

    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    setupAuthMock(mockedGetServerSession, createMockSession(userId));
    mockedFindMemberByUserId.mockResolvedValue(mockMember as any);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.userId).toBe(userId);
  });

  it('토픽 이슈에서 로그인 사용자가 새로 참여한다', async () => {
    const mockIssue = { title: 'Test Issue', topicId: 'topic-1', status: 'SELECT', projectId: null };

    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    setupAuthMock(mockedGetServerSession, createMockSession(userId));
    mockedFindMemberByUserId.mockResolvedValue(null);
    mockedPrismaTransaction.mockImplementation(async (callback: any) => {
      mockedAddIssueMember.mockResolvedValue(undefined);
      return callback({});
    });

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 201);

    expect(data.userId).toBe(userId);
  });

  it('빠른 이슈에서 nickname이 없으면 400 에러를 반환한다', async () => {
    const mockIssue = { title: 'Test Issue', topicId: null, status: 'SELECT', projectId: null };

    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    setupAuthMock(mockedGetServerSession, null);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 400, 'NICKNAME_REQUIRED');
  });

  it('빠른 이슈에서 익명 사용자가 참여한다', async () => {
    const mockIssue = { title: 'Test Issue', topicId: null, status: 'SELECT', projectId: null };
    const mockUser = { id: 'anonymous-user-1', nickname: 'Anonymous User' };

    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    setupAuthMock(mockedGetServerSession, null);
    mockedPrismaTransaction.mockImplementation(async (callback: any) => {
      mockedCreateAnonymousUser.mockResolvedValue(mockUser as any);
      mockedAddIssueMember.mockResolvedValue(undefined);
      return callback({});
    });

    const req = createMockRequest({ nickname: 'Anonymous User' });
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 201);

    expect(data.userId).toBe('anonymous-user-1');
  });
});
