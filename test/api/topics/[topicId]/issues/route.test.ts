import { getServerSession } from 'next-auth';
import { GET, POST } from '@/app/api/topics/[topicId]/issues/route';
import { prisma } from '@/lib/prisma';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { createIssue } from '@/lib/repositories/issue.repository';
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
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    issue: {
      findMany: jest.fn(),
    },
  },
}));

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedCreateIssue = createIssue as jest.MockedFunction<typeof createIssue>;
const mockedAddIssueOwner = issueMemberRepository.addIssueOwner as jest.MockedFunction<
  typeof issueMemberRepository.addIssueOwner
>;
const mockedPrismaTransaction = prisma.$transaction as jest.MockedFunction<
  typeof prisma.$transaction
>;
const mockedFindMany = prisma.issue.findMany as jest.MockedFunction<typeof prisma.issue.findMany>;

describe('GET /api/topics/[topicId]/issues', () => {
  const topicId = 'topic-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 이슈 목록을 조회한다', async () => {
    const mockIssues = [
      { id: 'issue-1', title: 'Issue 1', status: 'SELECT', createdAt: new Date() },
      { id: 'issue-2', title: 'Issue 2', status: 'VOTE', createdAt: new Date() },
    ];

    mockedFindMany.mockResolvedValue(mockIssues as any);

    const req = createMockGetRequest();
    const params = createMockParams({ topicId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data).toHaveLength(2);
    expect(mockedFindMany).toHaveBeenCalledWith({
      where: { topicId, deletedAt: null },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
});

describe('POST /api/topics/[topicId]/issues', () => {
  const topicId = 'topic-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증되지 않은 사용자는 401 에러를 받는다', async () => {
    setupAuthMock(mockedGetServerSession, null);

    const req = createMockRequest({ title: 'New Issue' });
    const params = createMockParams({ topicId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 401, 'UNAUTHORIZED');
  });

  it('title이 없으면 400 에러를 반환한다', async () => {
    setupAuthMock(mockedGetServerSession, createMockSession(userId));

    const req = createMockRequest({});
    const params = createMockParams({ topicId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 400, 'TITLE_REQUIRED');
  });

  it('성공적으로 이슈를 생성한다', async () => {
    const mockIssue = { id: 'issue-1', title: 'New Issue', topicId };
    const mockIssueMember = {
      id: 'member-1',
      issueId: 'issue-1',
      userId,
      role: 'OWNER' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    setupAuthMock(mockedGetServerSession, createMockSession(userId));
    mockedPrismaTransaction.mockImplementation(async (callback: any) => {
      mockedCreateIssue.mockResolvedValue(mockIssue as any);
      mockedAddIssueOwner.mockResolvedValue(mockIssueMember as any);
      return callback({});
    });

    const req = createMockRequest({ title: 'New Issue' });
    const params = createMockParams({ topicId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 201);

    expect(data.issueId).toBe('issue-1');
  });
});
