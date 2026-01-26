import { getServerSession } from 'next-auth';
import { DELETE, PATCH, POST } from '@/app/api/issues/[issueId]/close-modal/route';
import { MEMBER_ROLE } from '@/constants/issue';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
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
jest.mock('@/lib/utils/cookie', () => ({
  getUserIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/sse/sse-service');

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedFindIssueById = findIssueById as jest.MockedFunction<typeof findIssueById>;
const mockedFindMemberByUserId = issueMemberRepository.findMemberByUserId as jest.MockedFunction<
  typeof issueMemberRepository.findMemberByUserId
>;

const { getUserIdFromRequest } = require('@/lib/utils/cookie');
const mockedGetUserIdFromRequest = getUserIdFromRequest as jest.MockedFunction<
  typeof getUserIdFromRequest
>;

describe('POST /api/issues/[issueId]/close-modal', () => {
  const issueId = 'issue-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('이슈가 없으면 404 에러를 반환한다', async () => {
    mockedFindIssueById.mockResolvedValue(null);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 404, 'ISSUE_NOT_FOUND');
  });

  it('userId가 없으면 401 에러를 반환한다', async () => {
    const mockIssue = { title: 'Test Issue', topicId: null, status: 'SELECT', projectId: null };
    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    mockedGetUserIdFromRequest.mockReturnValue(undefined);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 401, 'USER_ID_REQUIRED');
  });

  it('방장이 아니면 403 에러를 반환한다', async () => {
    const mockIssue = { title: 'Test Issue', topicId: null, status: 'SELECT', projectId: null };
    const mockMember = {
      role: MEMBER_ROLE.MEMBER,
      user: { id: userId, displayName: 'Test User' },
    };

    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    mockedGetUserIdFromRequest.mockReturnValue(userId);
    mockedFindMemberByUserId.mockResolvedValue(mockMember as any);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 403, 'OWNER_PERMISSION_REQUIRED');
  });

  it('방장이 성공적으로 모달을 연다 (빠른 이슈)', async () => {
    const mockIssue = { title: 'Test Issue', topicId: null, status: 'SELECT', projectId: null };
    const mockMember = {
      role: MEMBER_ROLE.OWNER,
      user: { id: userId, displayName: 'Test User' },
    };

    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    mockedGetUserIdFromRequest.mockReturnValue(userId);
    mockedFindMemberByUserId.mockResolvedValue(mockMember as any);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.success).toBe(true);
  });

  it('방장이 성공적으로 모달을 연다 (토픽 이슈)', async () => {
    const mockIssue = { title: 'Test Issue', topicId: 'topic-1', status: 'SELECT', projectId: null };
    const mockMember = {
      role: MEMBER_ROLE.OWNER,
      user: { id: userId, displayName: 'Test User' },
    };

    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    setupAuthMock(mockedGetServerSession, createMockSession(userId));
    mockedFindMemberByUserId.mockResolvedValue(mockMember as any);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.success).toBe(true);
  });
});

describe('DELETE /api/issues/[issueId]/close-modal', () => {
  const issueId = 'issue-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('userId가 없으면 401 에러를 반환한다', async () => {
    mockedGetUserIdFromRequest.mockReturnValue(undefined);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId });

    const response = await DELETE(req, params);
    await expectErrorResponse(response, 401, 'USER_ID_REQUIRED');
  });

  it('방장이 성공적으로 모달을 닫는다', async () => {
    const mockMember = {
      role: MEMBER_ROLE.OWNER,
      user: { id: userId, displayName: 'Test User' },
    };

    mockedGetUserIdFromRequest.mockReturnValue(userId);
    mockedFindMemberByUserId.mockResolvedValue(mockMember as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId });

    const response = await DELETE(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.success).toBe(true);
  });
});

describe('PATCH /api/issues/[issueId]/close-modal', () => {
  const issueId = 'issue-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('userId가 없으면 401 에러를 반환한다', async () => {
    mockedGetUserIdFromRequest.mockReturnValue(undefined);

    const req = createMockRequest({ memo: 'Test memo' });
    const params = createMockParams({ issueId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 401, 'USER_ID_REQUIRED');
  });

  it('방장이 성공적으로 메모를 업데이트한다', async () => {
    const mockMember = {
      role: MEMBER_ROLE.OWNER,
      user: { id: userId, displayName: 'Test User' },
    };

    mockedGetUserIdFromRequest.mockReturnValue(userId);
    mockedFindMemberByUserId.mockResolvedValue(mockMember as any);

    const req = createMockRequest({ memo: 'Updated memo' });
    const params = createMockParams({ issueId });

    const response = await PATCH(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.success).toBe(true);
  });
});
