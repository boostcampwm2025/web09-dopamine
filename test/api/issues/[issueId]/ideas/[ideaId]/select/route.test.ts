import {
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';
import { POST } from '@/app/api/issues/[issueId]/ideas/[ideaId]/select/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    idea: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    // 배열형 트랜잭션을 단순 Promise.all로 모킹
    $transaction: jest.fn((promises) => Promise.all(promises)),
  },
}));
jest.mock('@/lib/sse/sse-service');

const mockedFindFirst = prisma.idea.findFirst as jest.MockedFunction<typeof prisma.idea.findFirst>;
const mockedUpdateMany = prisma.idea.updateMany as jest.MockedFunction<
  typeof prisma.idea.updateMany
>;
const mockedUpdate = prisma.idea.update as jest.MockedFunction<typeof prisma.idea.update>;

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
    mockedUpdateMany.mockResolvedValue({ count: 1 } as any);
    mockedUpdate.mockResolvedValue({ id: ideaId, isSelected: true } as any);

    const req = createMockRequest({});
    const params = createMockParams({ issueId, ideaId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.ok).toBe(true);

    // 호출 검증
    expect(mockedFindFirst).toHaveBeenCalledWith({
      where: {
        id: ideaId,
        issueId,
        deletedAt: null,
      },
      select: { id: true },
    });

    // 트랜잭션 내 로직 검증
    expect(mockedUpdateMany).toHaveBeenCalledWith({
      where: { issueId, deletedAt: null },
      data: { isSelected: false },
    });
    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { id: ideaId },
      data: { isSelected: true },
    });
  });
});
