import { POST } from '@/app/api/issues/[issueId]/ideas/[ideaId]/vote/route';
import { voteService } from '@/lib/services/vote.service';
import {
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/services/vote.service');
jest.mock('@/lib/sse/sse-service');

const mockedCastVote = voteService.castVote as jest.MockedFunction<typeof voteService.castVote>;

describe('POST /api/issues/[issueId]/ideas/[ideaId]/vote', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('userId나 voteType이 없으면 400 에러를 반환한다', async () => {
    const req = createMockRequest({});
    const params = createMockParams({ issueId, ideaId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 400, 'INVALID_VOTE_REQUEST');
  });

  it('성공적으로 투표를 생성한다', async () => {
    const mockResult = {
      agreeCount: 5,
      disagreeCount: 2,
    };

    mockedCastVote.mockResolvedValue(mockResult as any);

    const req = createMockRequest({ userId: 'user-1', voteType: 'AGREE' });
    const params = createMockParams({ issueId, ideaId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.agreeCount).toBe(5);
    expect(mockedCastVote).toHaveBeenCalledWith(ideaId, 'user-1', 'AGREE');
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedCastVote.mockRejectedValue(new Error('Database error'));

    const req = createMockRequest({ userId: 'user-1', voteType: 'AGREE' });
    const params = createMockParams({ issueId, ideaId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 500, 'VOTE_FAILED');
  });
});
