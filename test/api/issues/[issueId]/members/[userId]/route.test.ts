import { GET } from '@/app/api/issues/[issueId]/members/[userId]/route';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import {
  createMockGetRequest,
  createMockParams,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/repositories/issue-member.repository');

const mockedFindMemberByUserId = issueMemberRepository.findMemberByUserId as jest.MockedFunction<
  typeof issueMemberRepository.findMemberByUserId
>;

describe('GET /api/issues/[issueId]/members/[userId]', () => {
  const issueId = 'issue-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 사용자 정보를 조회한다', async () => {
    const mockMember = {
      role: 'OWNER' as const,
      user: {
        id: userId,
        displayName: 'Test User',
      },
    };

    mockedFindMemberByUserId.mockResolvedValue(mockMember as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, userId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.id).toBe(userId);
    expect(data.displayName).toBe('Test User');
    expect(data.role).toBe('OWNER');
  });

  it('존재하지 않는 멤버를 조회하면 404 에러를 반환한다', async () => {
    mockedFindMemberByUserId.mockResolvedValue(null);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, userId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 404, 'MEMBER_NOT_FOUND');
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedFindMemberByUserId.mockRejectedValue(new Error('Database error'));

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, userId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 500, 'MEMBER_FETCH_FAILED');
  });
});
