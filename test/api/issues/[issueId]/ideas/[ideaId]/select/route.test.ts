import { POST } from '@/app/api/issues/[issueId]/ideas/[ideaId]/select/route';
import { prisma } from '@/lib/prisma';
import {
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    idea: {
      findFirst: jest.fn(),
    },
  },
}));
jest.mock('@/lib/sse/sse-service');

const mockedFindFirst = prisma.idea.findFirst as jest.MockedFunction<
  typeof prisma.idea.findFirst
>;

describe('POST /api/issues/[issueId]/ideas/[ideaId]/select', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('존재하지 않는 아이디어를 선택하면 404 에러를 반환한다', async () => {
    mockedFindFirst.mockResolvedValue(null);

    const req = createMockRequest({});
    const params = createMockParams({ issueId, ideaId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 404, 'IDEA_NOT_FOUND');
  });

  it('성공적으로 아이디어를 선택한다', async () => {
    const mockIdea = { id: ideaId };

    mockedFindFirst.mockResolvedValue(mockIdea as any);

    const req = createMockRequest({});
    const params = createMockParams({ issueId, ideaId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.ok).toBe(true);
    expect(mockedFindFirst).toHaveBeenCalledWith({
      where: {
        id: ideaId,
        issueId,
        deletedAt: null,
      },
      select: { id: true },
    });
  });
});
