import { POST } from '@/app/api/issues/route';
import { prisma } from '@/lib/prisma';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { createIssue } from '@/lib/repositories/issue.repository';
import { createAnonymousUser } from '@/lib/repositories/user.repository';
import {
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
  setupPrismaTransactionMock,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/repositories/issue.repository');
jest.mock('@/lib/repositories/user.repository');
jest.mock('@/lib/repositories/issue-member.repository');
jest.mock('@/lib/utils/cookie');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

const mockedCreateIssue = createIssue as jest.MockedFunction<typeof createIssue>;
const mockedCreateAnonymousUser = createAnonymousUser as jest.MockedFunction<
  typeof createAnonymousUser
>;
const mockedAddIssueMember = issueMemberRepository.addIssueMember as jest.MockedFunction<
  typeof issueMemberRepository.addIssueMember
>;
const mockedPrismaTransaction = prisma.$transaction as jest.MockedFunction<
  typeof prisma.$transaction
>;

describe('POST /api/issues (빠른 이슈 생성)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('nickname과 title이 없으면 400 에러를 반환한다', async () => {
    const req = createMockRequest({});

    const response = await POST(req);
    await expectErrorResponse(response, 400, 'NICKNAME_AND_TITLE_REQUIRED');
  });

  it('nickname만 없으면 400 에러를 반환한다', async () => {
    const req = createMockRequest({ title: 'Test Issue' });

    const response = await POST(req);
    await expectErrorResponse(response, 400, 'NICKNAME_AND_TITLE_REQUIRED');
  });

  it('title만 없으면 400 에러를 반환한다', async () => {
    const req = createMockRequest({ nickname: 'Test User' });

    const response = await POST(req);
    await expectErrorResponse(response, 400, 'NICKNAME_AND_TITLE_REQUIRED');
  });

  it('성공적으로 이슈를 생성한다', async () => {
    const mockUser = { id: 'user-1', nickname: 'Test User' };
    const mockIssue = { id: 'issue-1', title: 'Test Issue' };

    setupPrismaTransactionMock(mockedPrismaTransaction, (mockTx) => {
      mockedCreateAnonymousUser.mockResolvedValue(mockUser as any);
      mockedCreateIssue.mockResolvedValue(mockIssue as any);
      mockedAddIssueMember.mockResolvedValue(undefined);
      return mockTx;
    });

    const req = createMockRequest({ title: 'Test Issue', nickname: 'Test User' });
    const response = await POST(req);
    const data = await expectSuccessResponse(response, 201);

    expect(data.issueId).toBe('issue-1');
    expect(data.userId).toBe('user-1');
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedPrismaTransaction.mockRejectedValue(new Error('Database error'));

    const req = createMockRequest({ title: 'Test Issue', nickname: 'Test User' });
    const response = await POST(req);
    await expectErrorResponse(response, 500, 'ISSUE_CREATE_FAILED');
  });
});
