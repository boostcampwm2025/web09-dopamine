import { POST } from '@/app/api/issues/[issueId]/members/nickname/route';
import { issueMemberService } from '@/lib/services/issue-member.service';
import {
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/services/issue-member.service');
jest.mock('@/lib/sse/sse-service');

const mockedCreateUniqueNickname = issueMemberService.createUniqueNickname as jest.MockedFunction<
  typeof issueMemberService.createUniqueNickname
>;

describe('POST /api/issues/[issueId]/members/nickname', () => {
  const issueId = 'issue-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 고유 닉네임을 생성한다', async () => {
    const mockNickname = '고유한닉네임123';

    mockedCreateUniqueNickname.mockResolvedValue(mockNickname);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.nickname).toBe(mockNickname);
    expect(mockedCreateUniqueNickname).toHaveBeenCalledWith(issueId);
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedCreateUniqueNickname.mockRejectedValue(new Error('Database error'));

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 500, 'NICKNAME_GENERATION_FAILED');
  });
});
